import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';
import BoardRow from './Row';
import DropRow from './DropRow';
import Item from './Item';
import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { getRowsCount, isItemExist as isItemExistHelper, getRowCellsCount, isItem } from './itemHelpers';
import './styles.css';
import { DragLayer } from 'react-dnd';
import PlaceholderMarker from './PlaceholderMarker';

import { canDropOnItem, updatePositionOnItem } from './dropHelpers/item';
import { canDropOnRow, updatePositionOnRow } from './dropHelpers/row';
import { canDropOnHover, getDropDirectionOnHover, moveItemOnHover } from './dropHelpers/itemHover';

import { getHrPlaceholderMarkerPosition, getVrPlaceholderMarkerPosition } from './dropHelpers/placeholderMarker';

const boardStyles = {
	maxWidth: '640px',
	margin: '100px auto',
	position: 'relative'
};

export default class extends Component {
	syncState = {
		maxColsCount: 3
	};

	state = {
		rowsCount: 1,
		dragging: false,
		placeholderMarker: {
			type: null,
			visible: false,
			left: null,
			top: null
		},
		items: [
			{
				type: CANVAS_COMPONENT,
				row: 1,
				order: 1,
				size: 2
			},
			{
				type: CANVAS_COMPONENT,
				row: 2,
				order: 1,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 2,
				order: 2,
				size: 1
			},
			{
				type: CANVAS_COMPONENT,
				row: 2,
				order: 3,
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

	get elementBoundingRect() {
		return ReactDOM.findDOMNode(this).getBoundingClientRect();
	}

	setDraggingState = (dragging) => {
		let { dragItem } = this.state;

		if (!dragging) {
			dragItem = {};
			this.togglePlaceholderMarker({
				visible: false
			})
		}

		this.setState({
			dragging: dragging,
			dragItem
		});
	}
	setDraggingCell = async (metaData) => {
		await this.setState({
			dragItem: metaData
		});
	}

	updatePositionOnItem = async (dropItem) => {
		const { dragItem, items } = this.state;

		if (isItem({ sourceItem: dropItem, matchItem: dragItem })) {
			return;
		}

		const newItems = updatePositionOnItem({
			items,
			dropItem,
			dragItem
		});

		await this.setState({
			items: newItems,
			dragItem: {
				...dragItem,
				row: dropItem.row,
				order: dropItem.order
			}
		});

		this.updateRowsCount();
	}

	updatePositionOnRow = async (dropItem) => {
		const { dragItem, items } = this.state;

		if (isItem({ sourceItem: dropItem, matchItem: dragItem })) {
			return;
		}

		const newItems = updatePositionOnRow({
			items,
			dropItem,
			dragItem
		});

		await this.setState({
			items: newItems
		});

		this.updateRowsCount();
	}

	constructor(props) {
		super(props);

		this.state.items = this.state.items.map((item) => {
			const id = Math.floor(Math.random() * 301);

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

		if (!isItemExistHelper({ items, order, row })) {
			return null;
		}

		const componentMetaData = this.getComponentMetaData({ order, row });
		const isDragItem = this.state.dragItem.id === componentMetaData.id;

		return (
			<Item {...componentMetaData} setDraggingState={this.setDraggingState} setDraggingCell={this.setDraggingCell} isDragItem={isDragItem}>
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

	async togglePlaceholderMarker({ visible, type, top, left }) {
		if (visible && type === 'hr') {
			left = 0;
		}

		console.count('togglePlaceholderMarker');

		await this.setState({
			placeholderMarker: {
				visible,
				type,
				top,
				left
			}
		});
	}

	hoverOnRow = ({ cellBoundingRect, dropCell }) => {
		const { items, dragItem } = this.state;
		const canDrop = canDropOnRow({
			items,
			dropCell,
			dragItem,
		});

		if (!canDrop) {
			return;
		}

		const { elementBoundingRect } = this;
		const top = getHrPlaceholderMarkerPosition({ elementBoundingRect, cellBoundingRect });
		const { placeholderMarker } = this.state;

		if (placeholderMarker.top === top) {
			return;
		}

		this.togglePlaceholderMarker({
			visible: true,
			type: 'hr',
			top
		});
	}

	hoverOnItem = ({ dropCell, cellBoundingRect, clientOffset }) => {
		const { dragItem, items } = this.state;
		const helpersParams = {
			items,
			dropCell,
			dragItem,
			cellBoundingRect,
			clientOffset
		};

		const direction = getDropDirectionOnHover(helpersParams);

		const allow = canDropOnHover({
			...helpersParams,
			direction
		});

		if (!allow) {
			if (this.state.placeholderMarker.visible) {
				this.togglePlaceholderMarker({
					visible: false
				});
			}

			return;
		}

		const { elementBoundingRect } = this;
		const isItemExist = isItemExistHelper({ items, order: dropCell.order, row: dropCell.row });
		const { top, left } = getVrPlaceholderMarkerPosition({ elementBoundingRect, cellBoundingRect, direction, isItemExist });
		const { placeholderMarker } = this.state;

		if (placeholderMarker.top === top && placeholderMarker.left === left) {
			return;
		}

		this.togglePlaceholderMarker({
			visible: true,
			type: 'vr',
			top,
			left
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
				hoverOnItem={this.hoverOnItem}
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
				hoverOnRow={this.hoverOnRow}
				updatePosition={this.updatePositionOnRow}
				dragItem={this.state.dragItem}
			/>
		);
	}

	renderBoardRow(row, isLast) {
		const { items, dragging } = this.state;
		const cells = [];
		const colsCount = getRowCellsCount({ items, row });
		let rowCellsCapacity = 0;


		for (let order = 1; order <= colsCount; order++) {
			const componentMetaData = this.getComponentMetaData({ order, row });

			if (typeof componentMetaData !== 'undefined') {
				const cellKey = componentMetaData.id;
				let cellSize = componentMetaData.size;

				rowCellsCapacity += cellSize;

				cells.push(
					this.getCell({ cellKey, order, row, cellSize })
				);

			}
		}

		const { maxColsCount } = this.syncState;

		if (rowCellsCapacity < maxColsCount) {
			const order = colsCount + 1;
			const cellKey = `${row}_${order}`;
			cells.push(
				this.getCell({ cellKey, order, row, cellSize: maxColsCount - rowCellsCapacity })
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
		return (
			<div className='board' style={boardStyles}>
				<div className='board__grid'>
					{
						this.getRows()
					}
				</div>
				{this.state.placeholderMarker.visible && <PlaceholderMarker {...this.state.placeholderMarker} />}
			</div>
		);
	}
}