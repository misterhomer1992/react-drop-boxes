import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';

const squareTarget = {
    canDrop(props) {
        const { order, row } = props;

        return props.canDropTo({
            order,
            row
        });
    },

    drop(props, monitor) {
        const { order, row, updatePosition } = props;

        updatePosition({
            order,
            row
        })
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        getDropResult: monitor.getDropResult,
    };
}

const getBoardCellBackgroundColor = ({ canDrop, isOver }) => {
    if (canDrop && isOver) {
        return '#fcc419';
    }

    if (canDrop && !isOver) {
        return '#b2f2bb';
    }

    if (!canDrop && isOver) {
        return '#e8590c';
    }
}

@DropTarget('cell', squareTarget, collect)
class BoardCell extends Component {
    render() {
        const { connectDropTarget, isOver, canDrop, size, dragItem } = this.props;

        let cellPercentage = 33.3333333333;

        if (canDrop && isOver) {
            cellPercentage *= dragItem.size;
        } else {
            cellPercentage *= size;
        }

        var boardCellStyles = {
            backgroundColor: getBoardCellBackgroundColor({ canDrop, isOver }),
            width: `${cellPercentage}%`
        };

        return connectDropTarget(
            <div className='board__cell' style={boardCellStyles}>
                {this.props.children}
            </div>
        );
    }
}

BoardCell.defaultProps = {
    size: 1
};

export default BoardCell;