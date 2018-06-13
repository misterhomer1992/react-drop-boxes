import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows } from './itemHelpers';

const generalDropRules = [];

const canvasDropRules = [
	...generalDropRules,

	{
		name: 'is swap check',
		off: true,
		fn: ({ isSwap }) => {
			return !isSwap;
		}
	},
	{
		name: 'size drop item fit',
		off: true,
		fn: ({ items, dropCell, dragItem, isItemReplacement, isRowGhost }) => {
			if (isRowGhost || dropCell.row === dragItem.row) {
				return true;
			}

			const rowItems = getRowItems({
				items,
				row: dropCell.row
			});

			let totalRowItemsSize = rowItems.reduce((memo, item) => {
				return memo + item.size;
			}, dragItem.size);

			if (isItemReplacement) {
				const dropItem = getItem({
					items,
					row: dropCell.row,
					order: dropCell.order
				});

				totalRowItemsSize -= dropItem.size;
			}

			return totalRowItemsSize <= 3;
		}
	},

	{
		name: 'from drag row item fit',
		off: true,
		fn: ({ items, dropCell, dragItem, isItemReplacement, isRowGhost }) => {			
			if (isRowGhost || dropCell.row === dragItem.row) {
				return true;
			}

			if (!isItemReplacement) {
				return true;
			}

			const dropItem = getItem({
				items,
				row: dropCell.row,
				order: dropCell.order
			});

			const rowItems = getRowItems({
				items,
				row: dragItem.row
			});

			const initialSum = dropItem.size - dragItem.size;

			let totalRowItemsSize = rowItems.reduce((memo, item) => {
				return memo + item.size;
			}, initialSum);

			return totalRowItemsSize <= 3;
		}
	}
];

const formDropRules = [
	...generalDropRules
];

const areAllRulesIsValid = ({ rules, items, dropCell, dragItem, isSwap, isRowGhost }) => {
	return rules.every((rule) => {
		//we can switch any rule
		if (typeof rule.off !== 'undefined' && rule.off) {
			return true;
		}

		const result = rule.fn({ items, dropCell, dragItem, isSwap, isRowGhost });

		if (!result) {
			//console.log(`%cDrop on:${rule.name}`, 'color: red');
		}

		return result;
	});
};

const canDrop = ({ dropCell, dragItem, items, isRowGhost }) => {
	const rules = dragItem.type === CANVAS_COMPONENT ? canvasDropRules : formDropRules;
	const isSwap = isItemExist({
		items,
		row: dropCell.row,
		order: dropCell.order,
	});

	const result = areAllRulesIsValid({ rules, items, dropCell, dragItem, isSwap, isRowGhost });

	// if (result) {
	//     console.log(`%c
	//               / )
	//             .' /
	//         ---'  (____
	//                ((__)
	//             ._ ((___)
	//              -'((__)
	//         ---.___((_)
	//     `, 'font-size: 26px; color: #37b24d');
	// } else {
	//     console.log(`%c
	//                .-.
	//                | |
	//               _| |_
	//              | |_| |-.
	//             / )| |_|_|
	//            | |-' -^-'
	//            |     ||  |
	//            \\     '   /
	//             |       |
	//             |       |
	//             `, 'font-size: 22px; color: #e03131');
	// }

	return result;
};

const normalizeRows = ({ items }) => {
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

const normalizeOrderForMultipleRows = (items, { dragItem, dropItem }) => {
	const nextItemsInRow = getNextItemsInRow({
		items,
		row: dragItem.row,
		order: dragItem.order
	});

	const shouldNormalize = dragItem.row !== dropItem.row && nextItemsInRow.length > 0;

	if (!shouldNormalize) {
		return items;
	}

	const rowToNormalize = dragItem.row;

	return items.map((item) => {
		if (item.row !== rowToNormalize) {
			return item;
		}

		const order = item.order - 1;

		return {
			...item,
			order
		}
	});
};

const normalizeOrderForSingeRow = (items, { dragItem, dropItem }) => {
	const shouldNormalize = dragItem.row === dropItem.row;

	if (!shouldNormalize) {
		return items;
	}

	return items.map((item) => {
		const shouldNormalizeItem = dragItem.row === item.row && item.order > dragItem.order;

		if (!shouldNormalizeItem) {
			return item;
		}

		const order = item.order - 1;

		return {
			...item,
			order
		}
	});
};

const normalizeOrder = (items, params) => {
	items = normalizeOrderForSingeRow(items, params);
	items = normalizeOrderForMultipleRows(items, params);

	return items;
};

const updatePosition = ({ dragItem, dropItem, items }) => {
	items = items.map((item) => {
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

	items = normalizeOrder(items, {
		dragItem,
		dropItem
	});

	items = normalizeRows({
		items
	});

	return items;
};

export { canDrop, updatePosition };

