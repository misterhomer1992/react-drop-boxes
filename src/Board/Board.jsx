import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import Cell from './Cell';
import BoardRow from './Row';
import DropRow from './DropRow';
import Item from './Item';
import { CANVAS_COMPONENT } from './BoardComponentTypes';
import { getRowsCount, isItemExist as isItemExistHelper, getRowCellsCount, isItem } from './itemHelpers';
import './styles.css';
import PlaceholderMarker from './PlaceholderMarker';

import { moveItemToCell, getNormalizedDropCell } from './dropHelpers/item';
import { canDropOnRow, updatePositionOnRow } from './dropHelpers/row';
import { canDropOnHover, getDropDirectionOnHover, moveItemOnHover } from './dropHelpers/itemHover';

import { getHrPlaceholderMarkerPosition, getVrPlaceholderMarkerPosition } from './dropHelpers/placeholderMarker';

export default class extends Component {
	syncState = {
		maxColsCount: 3
	};

	state = {
		dragging: false,
		placeholderMarker: {
			type: null,
			visible: false,
			left: null,
			top: null,
			direction: null
		},
		itemCanDrop: false,
		dragItem: {},
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

	moveItemToCellAction = async (dropCell) => {
		const { dragItem, items } = this.state;
		const { direction } = this.state.placeholderMarker;
		dropCell = getNormalizedDropCell(dropCell, { items, direction, dragItem });

		const newItems = moveItemToCell(items, {
			dropCell,
			dragItem,
			direction
		});		

		await this.setState({
			items: newItems,
			dragItem: {
				...dragItem,
				row: dropCell.row,
				order: dropCell.order
			}
		});
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
	}

	componentDidMount() {
	}

	get rowsCount() {
		const { items } = this.state;

		return getRowsCount({ items });
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

	async togglePlaceholderMarker({ visible, type, top, left, direction }) {
		let itemCanDrop = true;

		if (visible && type === 'hr') {
			left = 0;
		}

		console.count('togglePlaceholderMarker');

		if (!visible && typeof type === 'undefined') {
			itemCanDrop = false;
		}

		await this.setState({
			placeholderMarker: {
				visible,
				type,
				top,
				left,
				direction
			},
			itemCanDrop
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

		if (placeholderMarker.top === top && placeholderMarker.left === left && placeholderMarker.direction === direction) {
			return;
		}

		this.togglePlaceholderMarker({
			visible: true,
			type: 'vr',
			top,
			left,
			direction
		});
	};

	getCell({ cellKey, order, row, cellSize }) {
		return (
			<Cell
				key={cellKey}
				order={order}
				row={row}
				size={cellSize}
				canDrop={this.state.itemCanDrop}
				hoverOnItem={this.hoverOnItem}
				moveItemToCell={this.moveItemToCellAction}
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
		const { rowsCount } = this;

		for (let i = 1; i <= rowsCount + 1; i++) {
			const isLast = i === rowsCount + 1;

			rows.push(
				this.renderBoardRow(i, isLast)
			);
		}

		return rows;
	}

	render() {
		return (
			<div className='board'>
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