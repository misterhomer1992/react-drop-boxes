import { findDOMNode } from 'react-dom'
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows, isLastItemInRow, isLastRow, getRowCellsCount } from '../itemHelpers';

const DROP_DIRECTIONS = {
    RIGHT: 'RIGHT',
    LEFT: 'LEFT'
};

const rules = [
    {
        name: 'drop & drag items are equal',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
            return !(dropCell.row === dragItem.row && dropCell.order === dragItem.order);
        }
    },
    {
        name: 'allow drop only for existing items',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
            return isItemExist({ items, order: dropCell.order, row: dropCell.row });
        }
    },
    {
        name: 'check siblings in one row',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
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
        fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
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
        name: 'if last item in row with right insertion',
        off: false,
        fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
            if (!isLastItemInRow({ items, row: dropCell.row, order: dropCell.order })) {
                return true;
            }

            return direction !== DROP_DIRECTIONS.RIGHT;
        }
    },
    // {
    //     name: 'check right drop direction',
    //     off: false,
    //     fn: ({ items, dropCell, dragItem, direction, clientOffset, component }) => {
    //         console.log(dropCell)
    //         if (direction === DROP_DIRECTIONS.LEFT) {
    //             return true;
    //         }

    //         return true;
    //     }
    // }
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

export const getHoverDropItem = (params) => {
    const { component, clientOffset } = params;

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const componentWidth = hoverBoundingRect.right - hoverBoundingRect.left;
    const hoverMiddleX = componentWidth / 2;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    const hoverClientXPercentage = hoverClientX * 100 / componentWidth;
    let direction;
    let allowDrop = true;

    if (hoverClientXPercentage < 25) {
        direction = DROP_DIRECTIONS.LEFT;
    } else if (hoverClientXPercentage > 75) {
        direction = DROP_DIRECTIONS.RIGHT;
    } else {
        allowDrop = false;
    }

    if (allowDrop) {
        allowDrop = areAllRulesIsValid(rules, {
            ...params,
            direction
        });
    }

    return {
        allowDrop,
        direction
    };
};