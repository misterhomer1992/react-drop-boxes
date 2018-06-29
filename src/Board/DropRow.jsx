import React, { Component } from 'react';
import { findDOMNode } from 'react-dom'
import { DropTarget } from 'react-dnd';
import classnames from 'classnames';

const squareTarget = {
	drop(props, monitor) {
		const { order, row, updatePosition, isRowGhost, isCellGhost } = props;

		updatePosition({
			order,
			row,
			isRowGhost,
			isCellGhost
		})
	},

	hover(props, monitor, component) {
		const { order, row, hoverOnRow } = props;
		
		const boundingRect = findDOMNode(component).getBoundingClientRect();

		hoverOnRow({
			targetBoundingRect: boundingRect,
			dropCell: {
				order,
				row
			},
		});
	}
};

function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop(),
		getDropResult: monitor.getDropResult,
		sourceClientOffset: monitor.getSourceClientOffset()
	};
}

@DropTarget('cell', squareTarget, collect)
class BoardCell extends Component {
	render() {
		const { connectDropTarget, isOver, canDrop } = this.props;

		const isActive = canDrop && isOver;
		const boardCellStyles = {
			backgroundColor: isActive ? '#fcc419' : ''
		};

		const compoenntClasses = classnames(
			'board__drop-row'
		);


		return connectDropTarget(
			<div className={compoenntClasses}>
				{this.props.children}
			</div>
		);
	}
}

BoardCell.defaultProps = {
};

export default BoardCell;