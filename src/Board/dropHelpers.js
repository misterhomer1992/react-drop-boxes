import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { isItem, getItem, getNextItemsInRow, isItemExist, getRowItems, getEmptyRows } from './itemHelpers';

const generalDropRules = [];

const canvasDropRules = [
	...generalDropRules,

	{
		name: 'size drop item fit',
		fn: ({ items, dropCell, dragItem, isItemReplacement }) => {
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
		off: false,
		fn: ({ items, dropCell, dragItem, isItemReplacement }) => {
			if (dropCell.row === dragItem.row) {
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
	},

	//row next empty item rule
	/*
		rule works only in one row boundary
	*/
	// {
	//     name: 'row boundary',
	//     fn: (items, dropCell, dragItem, isItemReplacement) => {
	//         //in different rows or the same item
	//         if (dropCell.row !== dragItem.row || (dropCell.row === dragItem.row && dropCell.order === dragItem.order)) {
	//             return true;
	//         }

	//         const dropItem = getItem({
	//             items,
	//             row: dropCell.row,
	//             order: dropCell.order,
	//         });

	//         return typeof dropItem !== 'undefined';
	//     }
	// }
];

const formDropRules = [
	...generalDropRules
];

const areAllRulesIsValid = ({ rules, items, dropCell, dragItem, isItemReplacement, dropItem }) => {
	return rules.every((rule) => {
		//we can switch any rule
		if (typeof rule.off !== 'undefined' && rule.off) {
			return true;
		}

		const result = rule.fn({ items, dropCell, dragItem, isItemReplacement, dropItem });

		if (!result) {
			//console.log(`%cDrop on:${rule.name}`, 'color: red');
		}

		return result;
	});
};

const canDrop = ({ dropCell, dragItem, items }) => {
	const rules = dragItem.type === CANVAS_COMPONENT ? canvasDropRules : formDropRules;
	const isItemReplacement = isItemExist({
		items,
		row: dropCell.row,
		order: dropCell.order,
	});
	let dropItem = null;

	if (isItemReplacement) {
		dropItem = getItem({
			items,
			row: dropCell.row,
			order: dropCell.order,
		});
	}

	const result = areAllRulesIsValid({ rules, items, dropCell, dragItem, isItemReplacement, dropItem });

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

const normalizeOrderForMultipleRows = (items, { dragItem, dropItem, hasSwap }) => {
	const nextItemsInRow = getNextItemsInRow({
		items,
		row: dragItem.row,
		order: dragItem.order
	});

	const shouldNormalize = dragItem.row !== dropItem.row && nextItemsInRow.length > 0 && !hasSwap;

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

const normalizeOrderForSingeRow = (items, { dragItem, dropItem, hasSwap }) => {
	const shouldNormalize = !hasSwap && dragItem.row === dropItem.row;

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
	let hasSwap = false;

	items = items.map((cell) => {
		const isNewItem = isItem({
			sourceItem: cell,
			matchItem: dragItem
		});

		if (isNewItem) {
			const newItem = getItem({ items, order: dragItem.order, row: dragItem.row })

			return {
				...newItem,
				row: dropItem.row,
				order: dropItem.order,
			};
		}

		const isOldItem = isItem({
			sourceItem: cell,
			matchItem: dropItem
		});

		if (isOldItem) {
			const oldItem = getItem({ items, order: dropItem.order, row: dropItem.row });
			hasSwap = true;

			return {
				...oldItem,
				row: dragItem.row,
				order: dragItem.order,
			};
		}

		return cell
	});

	items = normalizeOrder(items, {
		dragItem,
		dropItem,
		hasSwap
	});

	items = normalizeRows({
		items
	});

	return items;
};

export { canDrop, updatePosition };

