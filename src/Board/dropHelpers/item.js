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
        name: 'deny move for last item to placeholder in one row',
        off: false,
        fn: ({ items, dropCell, dragItem }) => {
            if (dragItem.row !== dropCell.row) {
                return true;
            }

            return !isLastItemInRow({
                items,
                row: dragItem.row,
                order: dragItem.order
            });
        }
    },
    {
        name: 'deny move in last row for single item',
        off: false,
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

const normalizeOrder = (items, { dragItem, dropItem }) => {
    const rowToNormalize = dragItem.row;

    return items.map((item) => {
        const shouldNormalize = item.row === rowToNormalize && item.order > dragItem.order;

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

const areAllRulesIsValid = (rules, params) => {
    return rules.every((rule) => {
        //we can switch any rule
        if (typeof rule.off !== 'undefined' && rule.off) {
            return true;
        }

        const result = rule.fn(params);

        if (!result) {
            //console.log(`%cDrop on:${rule.name}`, 'color: red');
        }

        return result;
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

export const canDropOnItem = (params) => {
    const { items, dropCell } = params;

    const isSwap = isItemExist({
        items,
        row: dropCell.row,
        order: dropCell.order,
    });

    if (isSwap) {
        return false;
    }

    return areAllRulesIsValid(rules, params);
};

export const normalizeNormalMove = (items, { dragItem, dropItem }) => {
    items = normalizeOrder(items, {
        dragItem,
        dropItem
    });

    items = normalizeRows(items);

    return items;
}

export const updatePositionOnItem = ({ dragItem, dropItem, items }) => {
    items = moveItem(items, {
        dragItem,
        dropItem
    });

    items = normalizeNormalMove(items, { dragItem, dropItem });

    return items;
};