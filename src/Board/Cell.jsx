import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import classnames from 'classnames';
import { throttle } from 'lodash';

const squareTarget = {
	canDrop(props, monitor) {
		const { order, row } = props;

		return props.canDropTo({
			order,
			row
		});
	},

	drop(props, monitor) {
		const { order, row, updatePosition } = props;

		// updatePosition({
		// 	order,
		// 	row
		// });
	},

	hover(props, monitor, component) {
		const { order, row, hoverOnItem } = props;

		hoverOnItem({
			dropCell: {
				order,
				row
			},
			component,
			clientOffset: monitor.getClientOffset()
		});
	}
};

function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop(),
		getDropResult: monitor.getDropResult,
		clientOffset: monitor.getClientOffset()
	};
}

const getBoardCellBackgroundColor = ({ canDrop, isOver }) => {
	if (canDrop && isOver) {
		return '#fcc419';
	}
};

const getCellWidth = (size) => {
	switch (size) {
		case 1:
			return 200;
		case 2:
			return 420;
		case 3:
			return 640;
	}
}

@DropTarget('cell', squareTarget, collect)
class Cell extends Component {
	render() {
		const { connectDropTarget, isOver, canDrop, size, dragItem, isRowGhost, isCellGhost } = this.props;

		let cellWidth;

		// if (isCellGhost) {
		//     cellPercentage = null;
		// } else {

		// }

		if (canDrop && isOver) {
			cellWidth = getCellWidth(dragItem.size)
		} else {
			cellWidth = getCellWidth(size)
		}

		var boardCellStyles = {
			//backgroundColor: getBoardCellBackgroundColor({ canDrop, isOver }),
			width: `${cellWidth}px`
		};

		const componentClasses = classnames('board__cell', {
			'board__cell--hr-ghost': isRowGhost,
			'board__cell--vr-ghost': isCellGhost
		});

		return connectDropTarget(
			<div className={componentClasses} style={boardCellStyles}>
				{this.props.children}
			</div>
		);
	}
}

Cell.defaultProps = {
	size: 1,
	isRowGhost: false,
	isCellGhost: false
};

export default Cell;