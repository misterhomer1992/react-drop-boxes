import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import classnames from 'classnames';

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

    endDrag(props, monitor) {
        props.setDraggingState(false);
    }
};

const cellCollect = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        draggingId: monitor.getItem()
    }
};

@DragSource('cell', cellSource, cellCollect)
export default class extends Component {

    render() {
        const { draggingId, isDragItem } = this.props;

        const componentStyle = {
            transform: isDragItem ? 'scale(0.6)' : 'scale(1)',
            backgroundColor: isDragItem ? '#a5d8ff' : '#4dabf7',
            boxShadow: isDragItem ? '0 8px 16px 0 rgba(0, 0, 0, 0.2)' : '0 0 0 0 rgba(0, 0, 0, 0)'
        };
        const componentClasses = classnames('board__item', {
            'board__item--fade-in': isDragItem
        });

        return (
            this.props.connectDragSource(
                <div className={componentClasses} style={componentStyle}>
                    {this.props.children}
                </div>
            )
        );
    }
}