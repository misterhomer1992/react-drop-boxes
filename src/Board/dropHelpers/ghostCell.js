import {
    isItem,
    getItem,
    getNextItemsInRow,
    isItemExist,
    getRowItems,
    getEmptyRows,
    getRowCellsCount
} from '../itemHelpers';

import { normalizeNormalMove } from './normal';

const rules = [
    {
        name: 'size drop item fit',
        off: false,
        fn: ({ items, dropCell, dragItem }) => {
            return true;
        }
    },
];

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

export const ghostCellCanDrop = (params) => {
    const result = areAllRulesIsValid(rules, params);

    return result;
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

const shouldNormalizeItems = (items, { dragItem, dropItem }) => {
    const siblingMove = dragItem.row === dropItem.row + 0.5 || dragItem.row === dropItem.row - 0.5;

    if (siblingMove) {
        const dropItemRowItemsCount = getRowCellsCount({ items, row: dragItem.row }) - 1;

        if (dropItemRowItemsCount === 0) {
            return false;
        }
    }

    return true;
};

export const updateGhostItemsPosition = ({ dragItem, dropItem, items }) => {
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