import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';

const squareTarget = {
    canDrop(props, monitor) {
        console.log(monitor.getClientOffset());

        return false;
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget()
    };
}

const getBoardCellBackgroundColor = ({ canDrop, isOver }) => {
    if (canDrop && isOver) {
        return '#fcc419';
    }
};

//@DropTarget('row', squareTarget, collect)

export default class extends Component {
    render() {
        const { connectDropTarget } = this.props;

        return (
            <div className='board__row'>
                {this.props.children}
            </div>
        );
    }
}