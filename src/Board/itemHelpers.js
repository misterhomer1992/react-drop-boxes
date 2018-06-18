const getRowsCount = ({ items }) => {
    return items.reduce((lastRowIndex, cell) => {
        const currentIndex = cell.row;
        return currentIndex > lastRowIndex ? currentIndex : lastRowIndex;
    }, 1);
};

const getRowItems = ({ items, row }) => {
    return items.reduce((memo, item) => {
        return item.row === row ? memo.concat(item) : memo;
    }, []);
};

const isItemExist = ({ items, order, row }) => {
    return items.some((boardComponentPosition) => {
        return order === boardComponentPosition.order && row === boardComponentPosition.row;
    });
};

const isItem = ({ sourceItem, matchItem, }) => {
    return sourceItem.order === matchItem.order && sourceItem.row === matchItem.row;
};

const getItem = ({ items, order, row }) => {
    return items.find((boardComponentPosition) => {
        return order === boardComponentPosition.order && row === boardComponentPosition.row;
    });
};

const getItemById = ({ items, order, row }) => {
    return items.find((boardComponentPosition) => {
        return order === boardComponentPosition.order && row === boardComponentPosition.row;
    });
};

const getEmptyRows = ({ items }) => {
    const rowsCount = getRowsCount({ items });
    const emptyRows = [];

    for (let row = 1; row < rowsCount; row++) {
        const rowItemsCount = getRowCellsCount({ items, row });

        if (rowItemsCount === 0) {
            emptyRows.push(row);
        }
    }

    return emptyRows;
};

const getRowCellsCount = ({ items, row }) => {
    return items.reduce((memo, cell) => {
        return cell.row === row ? memo + 1 : memo;
    }, 0);
};

const getNextItemsInRow = ({ items, row, order }) => {
    const rowItems = getRowItems({
        items,
        row
    });

    return rowItems.reduce((memo, item) => {
        return item.order > order ? memo.concat(item) : memo;
    }, []);
};

export {
    getItem,
    getRowsCount,
    getRowCellsCount,
    getNextItemsInRow,
    getRowItems,
    isItemExist,
    isItem,
    getEmptyRows
};