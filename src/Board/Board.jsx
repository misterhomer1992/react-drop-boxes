import React, { Component, Fragment } from 'react';
import BoardCell from './BoardCell';
import BoardRow from './BoardRow';
import BoardComponent from './BoardComponent';
import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { canDrop, updatePosition } from './dropHelpers/index';
import { getRowsCount, isItemExist, getRowCellsCount, isItem } from './itemHelpers';
import './styles.css';

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
	canDropTo = (dropCell) => {
		const { dragItem, items } = this.state;

		const isSwap = isItemExist({
			items,
			row: dropCell.row,
			order: dropCell.order,
		});

		if (isSwap) {
			return false;
		}

		return canDrop({
			items,
			dropCell,
			dragItem,
		});
	}
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
	updatePosition = (dropItem) => {
		const { dragItem, items } = this.state;

		if (isItem({ sourceItem: dropItem, matchItem: dragItem }) && !dropItem.isRowGhost) {
			return;
		}

		const newItems = updatePosition({
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
		return this.state.items.find((boardComponentPosition) => {
			return order === boardComponentPosition.order && row === boardComponentPosition.row;
		});
	}

	getBoardComponent({ order, row }) {
		const { items } = this.state;

		if (!isItemExist({ items, order, row })) {
			return null;
		}

		const componentMetaData = this.getComponentMetaData({ order, row });

		return (
			<BoardComponent {...componentMetaData} setDraggingState={this.setDraggingState} setDraggingCell={this.setDraggingCell}>
				id: {componentMetaData.id}
			</BoardComponent>
		);
	}

	getBoardCell({ cellKey, order, row, cellSize }) {
		return (
			<BoardCell
				key={cellKey}
				order={order}
				row={row}
				size={cellSize}
				canDropTo={this.canDropTo}
				updatePosition={this.updatePosition}
				dragItem={this.state.dragItem}
			>
				{
					this.getBoardComponent({
						order,
						row
					})
				}
			</BoardCell>
		);
	}

	getPlaceholderRow(row) {
		row = row - 0.5;

		const cellKey = `${row}_${1}`;

		return (
			<BoardRow key={`${row}_placeholder`}>
				<BoardCell
					key={cellKey}
					order={1}
					row={row}
					size={1}
					canDropTo={this.canDropTo}
					updatePosition={this.updatePosition}
					dragItem={this.state.dragItem}
					isRowGhost={true}
				></BoardCell>
			</BoardRow>
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
					this.getBoardCell({ cellKey, order, row, cellSize })
				);


			}
		}

		if (rowCapacity < 3) {
			const order = colsCount + 1;
			const cellKey = `${row}_${order}`;
			cells.push(
				this.getBoardCell({ cellKey, order, row, cellSize: 1 })
			);
		}

		return (
			<Fragment key={row}>
				{!isLast && this.getPlaceholderRow(row)}
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