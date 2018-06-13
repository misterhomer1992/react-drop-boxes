import {
	isItem,
	getItem,
	getNextItemsInRow,
	isItemExist,
	getRowItems,
	getEmptyRows,
	getRowCellsCount
} from '../itemHelpers';

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

const normalizeRowsForSingleDragItemInRow = (items, { dragItem, dropItem }) => {
	const targetRowCount = getRowCellsCount({
		items,
		row: dragItem.row
	});

	if (dragItem.row === dropItem.row + 0.5) {
		return items;
	}

	if (targetRowCount > 0) {
		return items;
	}

	return items.map((item) => {
		if (dragItem.row > item.row) {
			return item;
		}

		const row = item.row - 1;

		return {
			...item,
			row
		}
	});
};

const normalizeRowsForMultipleDragItemsInRow = (items, { dragItem, dropItem }) => {
	if (dragItem.row === dropItem.row + 0.5) {
		return items;
	}

	return items.map((item) => {

		if (dragItem.id === item.id || dropItem.row > item.row) {
			return item;
		}

		const row = item.row + 1;

		return {
			...item,
			row
		}
	});
};


const normalizeRows = (items, params) => {
	items = normalizeRowsForSingleDragItemInRow(items, params);
	items = normalizeRowsForMultipleDragItemsInRow(items, params);

	return items;
};

export const ghostCanDrop = (params) => {
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

		const newItem = getItem({ items, order: dragItem.order, row: dragItem.row })

		return {
			...newItem,
			row: dropItem.row + 0.5,
			order: dropItem.order,
		};
	});
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

	return items;
};