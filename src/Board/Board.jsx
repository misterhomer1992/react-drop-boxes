import React, { Component, Fragment } from 'react';
import Cell from './Cell';
import BoardRow from './Row';
import DropRow from './DropRow';
import Item from './Item';
import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { getRowsCount, isItemExist, getRowCellsCount, isItem } from './itemHelpers';
import './styles.css';

import { canDropOnItem, updatePositionOnItem } from './dropHelpers/item';
import { canDropOnRow, updatePositionOnRow } from './dropHelpers/row';

const boardStyles = {
	maxWidth: '400px',
	margin: '100px auto',
	position: 'relative'
};

export default class extends Component {
	syncState = {
		colsCount: 3
	};

	state = {
		rowsCount: 1,
		dragging: false,
		items: [
			{
				type: CANVAS_COMPONENT,
				row: 1,
				order: 1,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 2,
				order: 1,
				size: 2
			},
			{
				type: CANVAS_COMPONENT,
				row: 2,
				order: 2,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 3,
				order: 1,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 3,
				order: 2,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 4,
				order: 1,
				size: 3
			},
			{
				type: CANVAS_COMPONENT,
				row: 5,
				order: 1,
				size: 1
			},
		],
		dragItem: {}
	};

	setDraggingState = (dragging) => {
		this.setState({
			dragging: dragging
		});
	}
	setDraggingCell = async (metaData) => {
		await this.setState({
			dragItem: metaData
		});
	}

	updatePositionOnItem = (dropItem) => {
		const { dragItem, items } = this.state;

		if (isItem({ sourceItem: dropItem, matchItem: dragItem })) {
			return;
		}

		const newItems = updatePositionOnItem({
			items,
			dropItem,
			dragItem
		});

		this.setState({
			items: newItems
		});

		this.updateRowsCount();
	}

	updatePositionOnRow = (dropItem) => {
		const { dragItem, items } = this.state;

		if (isItem({ sourceItem: dropItem, matchItem: dragItem })) {
			return;
		}

		const newItems = updatePositionOnRow({
			items,
			dropItem,
			dragItem
		});

		this.setState({
			items: newItems
		});

		this.updateRowsCount();
	}

	constructor(props) {
		super(props);

		this.state.items = this.state.items.map((item) => {
			const id = Math.round(Math.random().toFixed(2) * 100);
			return {
				...item,
				id
			}
		});

		const { items } = this.state;

		this.state.rowsCount = getRowsCount({
			items
		});
	}

	componentDidMount() {
		console.log('%c¯\\_(ツ)_/¯', 'font-size: 66px; color: #37b24d');
	}

	updateRowsCount() {
		const { items } = this.state;
		const rowsCount = getRowsCount({ items })

		this.setState({
			rowsCount
		});
	}

	getComponentMetaData({ order, row }) {
		return this.state.items.find((item) => {
			return order === item.order && row === item.row;
		});
	}

	getItem({ order, row }) {
		const { items } = this.state;

		if (!isItemExist({ items, order, row })) {
			return null;
		}

		const componentMetaData = this.getComponentMetaData({ order, row });

		return (
			<Item {...componentMetaData} setDraggingState={this.setDraggingState} setDraggingCell={this.setDraggingCell}>
				id: {componentMetaData.id}
			</Item>
		);
	}

	canDropOnItem = (dropCell) => {
		const { dragItem, items } = this.state;

		return canDropOnItem({
			items,
			dropCell,
			dragItem,
		});
	};

	canDropOnRow = (dropCell) => {
		const { dragItem, items } = this.state;

		return canDropOnRow({
			items,
			dropCell,
			dragItem,
		});
	};

	getCell({ cellKey, order, row, cellSize }) {
		return (
			<Cell
				key={cellKey}
				order={order}
				row={row}
				size={cellSize}
				canDropTo={this.canDropOnItem}
				updatePosition={this.updatePositionOnItem}
				dragItem={this.state.dragItem}
			>
				{
					this.getItem({
						order,
						row
					})
				}
			</Cell>
		);
	}

	getDropRow(row) {
		row = row - 0.5;

		const cellKey = `${row}_${1}`;

		return (
			<DropRow
				key={cellKey}
				order={1}
				row={row}
				canDropTo={this.canDropOnRow}
				updatePosition={this.updatePositionOnRow}
				dragItem={this.state.dragItem}
			/>
		);
	}

	renderBoardRow(row, isLast) {
		const { items, dragging } = this.state;
		const cells = [];
		const colsCount = getRowCellsCount({ items, row });
		let rowCapacity = 0;


		for (let order = 1; order <= colsCount; order++) {
			const cellKey = `${row}_${order}`;
			const componentMetaData = this.getComponentMetaData({ order, row });

			if (typeof componentMetaData !== 'undefined') {
				let cellSize = componentMetaData.size;

				rowCapacity += cellSize;

				cells.push(
					this.getCell({ cellKey, order, row, cellSize })
				);


			}
		}

		if (rowCapacity < 3) {
			const order = colsCount + 1;
			const cellKey = `${row}_${order}`;
			cells.push(
				this.getCell({ cellKey, order, row, cellSize: 1 })
			);
		}

		return (
			<Fragment key={row}>
				{!isLast && this.getDropRow(row)}
				<BoardRow>
					{cells}
				</BoardRow>
			</Fragment>
		);
	}

	getRows() {
		const rows = [];

		for (let i = 1; i <= this.state.rowsCount + 1; i++) {
			const isLast = i === this.state.rowsCount + 1;

			rows.push(
				this.renderBoardRow(i, isLast)
			);
		}

		return rows;
	}

	render() {
		//console.table(this.state.items);

		return (
			<div className='board' style={boardStyles}>
				{
					this.getRows()
				}
			</div>
		);
	}
}