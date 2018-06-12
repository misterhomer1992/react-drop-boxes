import React, { Component } from 'react';
import { DragSource } from 'react-dnd';

const cellSource = {
    beginDrag(props, monitor, component) {
        const { id, order, row, type, size } = props;

        props.setDraggingCell({
            order,
            row,
            type,
            size,
            id
        });

        setTimeout(() => {
            props.setDraggingState(true);
        }, 100);

        return { id };
    },

    endDrag(props) {
        props.setDraggingState(false);
    }
};

const cellCollect = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

@DragSource('cell', cellSource, cellCollect)
export default class extends Component {

    render() {
        const { isDragging } = this.props;

        const componentStyle = {
            position: 'absolute',
            left: '5px',
            top: '5px',
            right: '5px',
            bottom: '5px',
            lineHeight: 3.5,
            transition: 'all ease 0.3s',
            transform: isDragging ? 'scale(0.6)' : 'scale(1)',
            backgroundColor: isDragging ? '#a5d8ff' : '#4dabf7'
        };

        return (
            this.props.connectDragSource(
                <div style={componentStyle}>
                    {this.props.children}
                </div>
            )
        );
    }
}