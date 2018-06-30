import { findDOMNode } from 'react-dom'
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows, isLastItemInRow, isLastRow, getRowCellsCount, itemHaveBothSiblings } from '../itemHelpers';
import { normalizeNormalMove } from './item';

const DROP_DIRECTIONS = {
    RIGHT: 'RIGHT',
    LEFT: 'LEFT'
};

const rules = [
    {
        name: 'drop & drag items are equal',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset }) => {
            return !(dropCell.row === dragItem.row && dropCell.order === dragItem.order);
        }
    },
    {
        name: 'check siblings in one row',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset }) => {
            if (dropCell.row !== dragItem.row) {
                return true;
            }

            if (dragItem.order - 1 === dropCell.order && direction === DROP_DIRECTIONS.RIGHT) {
                return false;
            }

            if (dragItem.order + 1 === dropCell.order && direction === DROP_DIRECTIONS.LEFT) {
                return false;
            }

            return true;
        }
    },
    {
        name: 'size drop item fit for not equal rows',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset }) => {
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
    }
];

const areAllRulesIsValid = (rules, params) => {
    return rules.every((rule) => {
        //we can switch any rule
        if (typeof rule.off !== 'undefined' && rule.off) {
            return true;
        }

        const result = rule.fn(params);

        if (!result) {
            //console.log(`%cDrop on: %c${rule.name}`, 'font-weight: bold', 'color: red');
        }

        return result;
    });
};

export const canDropOnHover = (params) => {
    return areAllRulesIsValid(rules, params);
};

export const getDropDirectionOnHover = (params) => {
    const { cellBoundingRect, clientOffset } = params;
    const componentWidth = cellBoundingRect.right - cellBoundingRect.left;
    const hoverMiddleX = componentWidth / 2;
    const hoverClientX = clientOffset.x - cellBoundingRect.left;

    return hoverClientX < hoverMiddleX ? DROP_DIRECTIONS.LEFT : DROP_DIRECTIONS.RIGHT;
};

const moveItem = (items, { dragItem, dropCell, direction }) => {
    const directionLeftToRight = dragItem.order < dropCell.order;
    let itemOrder = dropCell.order;

    if (directionLeftToRight && direction === DROP_DIRECTIONS.LEFT) {
        itemOrder -= 1;
    } else if (!directionLeftToRight && direction === DROP_DIRECTIONS.RIGHT) {
        itemOrder += 1;
    }

    return items.map((item) => {
        const isMatchedItem = isItem({
            sourceItem: item,
            matchItem: dragItem
        });

        if (!isMatchedItem) {
            return item;
        }

        return {
            ...item,
            row: dropCell.row,
            order: itemOrder
        }
    });
};

const normalizeHrMove = (items, { dragItem, dropCell, direction }) => {
    if (dropCell.row !== dragItem.row) {
        return items;
    }

    const directionLeftToRight = dragItem.order < dropCell.order;

    return items.map((item) => {
        const shouldNormalizeItem = dragItem.row === item.row && dragItem.id !== item.id;

        if (!shouldNormalizeItem) {
            return item;
        }

        let order = item.order;
        const isItemHaveBothSiblings = itemHaveBothSiblings(dragItem);

        if (directionLeftToRight) {
            if (isItemHaveBothSiblings) {
                if (item.order > dragItem.order) {
                    order -= 1;
                }
            } else {
                if (
                    (direction === DROP_DIRECTIONS.RIGHT && item.order <= dropCell.order) ||
                    (direction === DROP_DIRECTIONS.LEFT && item.order < dropCell.order)
                ) {
                    order -= 1;
                }
            }
        } else {
            if (isItemHaveBothSiblings) {
                if (item.order < dragItem.order) {
                    order += 1;
                }
            } else {
                if (
                    (direction === DROP_DIRECTIONS.RIGHT && item.order > dropCell.order) ||
                    (direction === DROP_DIRECTIONS.LEFT && item.order >= dropCell.order)
                ) {
                    order += 1;
                }
            }
        }


        return {
            ...item,
            row: dropCell.row,
            order
        }
    });
};

const normalizeVrMove = (items, { dragItem, dropCell, direction }) => {
    if (dropCell.row === dragItem.row) {
        return items;
    }

    items = items.map((item) => {
        const shouldNormalizeItem = dropCell.row === item.row && dropCell.order <= item.order && dragItem.id !== item.id;

        if (!shouldNormalizeItem) {
            return item;
        }

        return {
            ...item,
            order: item.order + 1
        }
    });

    return normalizeNormalMove(items, { dragItem, dropCell });
};

const normalizeDragItem = (dragItem, { dropCell, direction }) => {
    return {
        ...dragItem,
        row: dropCell.row,
        order: dropCell.order
    }
};

export const moveItemOnHover = ({ dragItem, dropCell, items, direction }) => {
    items = moveItem(items, {
        dragItem,
        dropCell,
        direction
    });

    items = normalizeHrMove(items, { dragItem, dropCell, direction });
    items = normalizeVrMove(items, { dragItem, dropCell, direction });

    return items;
};