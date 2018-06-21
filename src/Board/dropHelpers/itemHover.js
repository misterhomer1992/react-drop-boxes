import { findDOMNode } from 'react-dom'
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows, isLastItemInRow, isLastRow, getRowCellsCount, itemHaveBothSiblings } from '../itemHelpers';

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
            if (dropCell.row === dragItem.row) {
                return true;
            }

            if (!isLastItemInRow({ items, row: dropCell.row, order: dropCell.order })) {
                return true;
            }

            return direction !== DROP_DIRECTIONS.RIGHT;
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
            console.log(`%cDrop on: %c${rule.name}`, 'font-weight: bold', 'color: red');
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

    if (hoverClientXPercentage < 30) {
        direction = DROP_DIRECTIONS.LEFT;
    } else if (hoverClientXPercentage > 70) {
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

const moveItem = (items, { dragItem, dropCell, direction }) => {
    const directionLeftToRight = dragItem.order < dropCell.order;
    let itemOrder = dropCell.order;

    if (directionLeftToRight && direction === DROP_DIRECTIONS.LEFT) {
        itemOrder -= 1;
    } else if (!directionLeftToRight && direction === DROP_DIRECTIONS.RIGHT) {
        itemOrder += 1;
    }

    return {
        items: items.map((item) => {
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
        }),
        dragItem: {
            ...dragItem,
            row: dropCell.row,
            order: itemOrder
        }
    }
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

    return items.map((item) => {
        const shouldNormalizeItem = dropCell.row === item.row && dropCell.order <= item.order && dragItem.id !== item.id;

        if (!shouldNormalizeItem) {
            return item;
        }
        
        return {
            ...item,
            order: item.order + 1
        }
    });
};

const normalizeDragItem = (dragItem, { dropCell, direction }) => {
    return {
        ...dragItem,
        row: dropCell.row,
        order: dropCell.order
    }
};

export const moveItemOnHover = ({ dragItem, dropCell, items, direction }) => {
    const movedData = moveItem(items, {
        dragItem,
        dropCell,
        direction
    });

    items = movedData.items;
    items = normalizeHrMove(items, { dragItem, dropCell, direction });
    items = normalizeVrMove(items, { dragItem, dropCell, direction });

    return {
        items: items,
        dragItem: movedData.dragItem
    };
};