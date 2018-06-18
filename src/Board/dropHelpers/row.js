import {
    isItem,
    getItem,
    getNextItemsInRow,
    isItemExist,
    getRowItems,
    getEmptyRows,
    getRowCellsCount
} from '../itemHelpers';

import { normalizeNormalMove } from './item';

const rules = [
    {
        name: 'not a single item in row',
        off: false,
        fn: ({ items, dropCell, dragItem }) => {
            const rowItemsCount = getRowCellsCount({
                items,
                row: dragItem.row
            }) - 1;
            const hasItemsInRow = rowItemsCount !== 0;
            const currentRow = dragItem.row;
            const isSiblingRow = dropCell.row + 0.5 === currentRow || dropCell.row - 0.5 === currentRow;

            return (isSiblingRow && hasItemsInRow) || (!isSiblingRow && !hasItemsInRow);
        }
    },
];

const normalizeRows = (items, { dropItem, dragItem }) => {
    const dropItemRow = dropItem.row + 0.5;
    return items.map((item) => {

        if (item.row < dropItemRow || dragItem.id === item.id) {
            return item;
        }

        return {
            ...item,
            row: item.row + 1
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

        const newItem = getItem({ items, order: dragItem.order, row: dragItem.row });

        return {
            ...newItem,
            row: dropItem.row + 0.5,
            order: dropItem.order,
        };
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

export const canDropOnRow = (params) => {
    const { items, dropCell } = params;

    return areAllRulesIsValid(rules, params);
};

export const updatePositionOnRow = ({ dragItem, dropItem, items }) => {
    items = moveItem(items, {
        dragItem,
        dropItem
    });

    items = normalizeRows(items, {
        dragItem,
        dropItem
    });

    dropItem = {
        ...dropItem,
        row: dropItem.row + 0.5
    }

    dragItem = {
        ...dragItem,
        row: dropItem.row
    }

    items = normalizeNormalMove(items, { dragItem, dropItem });

    return items;
};