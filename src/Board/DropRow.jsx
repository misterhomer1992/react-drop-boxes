import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import classnames from 'classnames';

const squareTarget = {
	canDrop (props, monitor) {
		const { order, row, isRowGhost, isCellGhost } = props;

		//console.log(monitor.getClientOffset());

		return props.canDropTo({
			order,
			row,
			isRowGhost,
			isCellGhost
		});
	},

	drop (props, monitor) {
		const { order, row, updatePosition, isRowGhost, isCellGhost } = props;

		updatePosition({
			order,
			row,
			isRowGhost,
			isCellGhost
		})
	}
};

function collect (connect, monitor) {
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
	render () {
		const { connectDropTarget, isOver, canDrop } = this.props;

		const isActive = canDrop && isOver;
		const boardCellStyles = {
			backgroundColor: isActive ? '#fcc419' : ''
		};

		const compoenntClasses = classnames(
			'board__drop-row',
			{
				'board__drop-row--over': isActive
			}
		);


		return connectDropTarget(
			<div className={compoenntClasses} style={boardCellStyles}>
				{this.props.children}
			</div>
		);
	}
}

BoardCell.defaultProps = {
};

export default BoardCell;