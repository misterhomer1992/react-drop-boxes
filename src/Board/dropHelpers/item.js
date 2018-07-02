import { findDOMNode } from 'react-dom'
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows, isLastItemInRow, isLastRow, getRowCellsCount } from '../itemHelpers';

const rules = [
    {
        name: 'size drop item fit',
        off: false,
        fn: ({ items, dropCell, dragItem }) => {
            if (dropCell.row === dragItem.row) {
                return true;
            }

            const rowItems = getRowItems({
                items,
                row: dropCell.row
            });

            let totalRowItemsSize = rowItems.reduce((memo, item) => {
                return memo + item.size;
            }, dragItem.size);

            return totalRowItemsSize <= 3;
        }
    },
    {
        name: 'deny move in last row for single item',
        off: true,
        fn: ({ items, dropCell, dragItem }) => {
            if (!isLastRow({ items, row: dragItem.row })) {
                return true;
            }

            const rowCellsCount = getRowCellsCount({ items, row: dropCell.row });
            const allowMove = rowCellsCount !== 0;

            return allowMove;
        }
    },
];

const normalizeRows = (items) => {
    const emptyRows = getEmptyRows({
        items
    });
    const shouldNormalize = emptyRows.length > 0;

    if (!shouldNormalize) {
        return items;
    }

    //I should add normalization for multiple rows in future
    const emptyRow = emptyRows[0];

    return items.map((item) => {
        if (item.row < emptyRow) {
            return item;
        }

        const row = item.row - 1;

        return {
            ...item,
            row
        }
    });
};

export const normalizeNormalMove = (items, { dragItem, dropItem }) => {
    items = normalizeOrder(items, {
        dragItem,
        dropItem
    });

    items = normalizeRows(items);

    return items;
}

export const normalizeOrder = (items, { dragItem, dropItem }) => {
    return items.map((item) => {
        const shouldNormalize = item.row === dragItem.row && item.order > dragItem.order;

        if (!shouldNormalize) {
            return item;
        }

        const order = item.order - 1;

        return {
            ...item,
            order
        }
    });
};

const moveItem = (items, { dragItem, dropItem }) => {
    return items.map((item) => {
        const isMatchedItem = isItem({
            sourceItem: item,
            matchItem: dragItem
        });

        if (!isMatchedItem) {
            return item;
        }

        const newItem = getItem({ items, order: dragItem.order, row: dragItem.row })

        return {
            ...newItem,
            row: dropItem.row,
            order: dropItem.order,
        };
    });
};

const processMoveAction = (items, { dropCell, dragItem }) => {
    return items.map(item => {
        const isTargetItem = isItem({
            sourceItem: item,
            matchItem: dragItem
        });

        if (!isTargetItem) {
            return item;
        }

        return {
            ...item,
            row: dropCell.row,
            order: dropCell.order
        }
    });
}

const processNewPositionForSameRow = (items, { dropCell, dragItem, direction }) => {
    const movedLeftToRight = dragItem.order < dropCell.order;

    return items.map(item => {
        const itemShouldNormalize = item.row === dropCell.row &&
            item.id !== dragItem.id;

        if (!itemShouldNormalize) {
            return item;
        }

        let orderChange = movedLeftToRight ? -1 : 1;

        return {
            ...item,
            order: item.order + orderChange
        }
    });
};

const processNewPositionForDiferrentRows = (items, { dropCell, dragItem }) => {
    return items.map(item => {
        const itemShouldNormalize = item.row === dropCell.row &&
            item.order >= dropCell.order &&
            item.id !== dragItem.id;

        if (!itemShouldNormalize) {
            return item;
        }

        return {
            ...item,
            order: item.order + 1
        }
    });
};

const processNewPosition = (items, { dropCell, dragItem, direction }) => {
    if (dropCell.row === dragItem.row) {
        return processNewPositionForSameRow(items, { dropCell, dragItem, direction });
    } else {
        return processNewPositionForDiferrentRows(items, { dropCell, dragItem });
    }
}

/*
    params Object - {dropCell, dragItem}
*/
export const moveItemToCell = (items, params) => {
    items = processMoveAction(items, params);
    items = processNewPosition(items, params);

    return items;
}