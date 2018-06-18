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

		var boardCellStyles = {
			backgroundColor: canDrop && isOver ? '#fcc419' : ''
		};

		return connectDropTarget(
			<div className='board__drop-row' style={boardCellStyles}>
				{this.props.children}
			</div>
		);
	}
}

BoardCell.defaultProps = {
};

export default BoardCell;