import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import classnames from 'classnames';

const squareTarget = {
    canDrop(props, monitor) {
        const { order, row, isRowGhost } = props;

        //console.log(monitor.getClientOffset());
    
        return props.canDropTo({
            order,
            row,
            isRowGhost
        });
    },

    drop(props, monitor) {
        const { order, row, updatePosition, isRowGhost } = props;

        updatePosition({
            order,
            row,
            isRowGhost
        })
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

const getBoardCellBackgroundColor = ({ canDrop, isOver }) => {
    if (canDrop && isOver) {
        return '#fcc419';
    }

    if (canDrop && !isOver) {
        return '#b2f2bb';
    }
}

@DropTarget('cell', squareTarget, collect)
class BoardCell extends Component {
    render() {
        const { connectDropTarget, isOver, canDrop, size, dragItem, isRowGhost } = this.props;

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

        const componentClasses = classnames('board__cell', {
            'board__cell--hr-ghost': isRowGhost
        });

        return connectDropTarget(
            <div className={componentClasses} style={boardCellStyles}>
                {this.props.children}
            </div>
        );
    }
}

BoardCell.defaultProps = {
    size: 1,
    isRowGhost: false
};

export default BoardCell;