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
        connectDragPreview: connect.dragPreview(),
        draggingId: monitor.getItem(),
        isDragging: monitor.isDragging()
    }
};

@DragSource('cell', cellSource, cellCollect)
export default class extends Component {
    componentDidMount() {
        const { connectDragPreview } = this.props;
    
        const img = new Image();
        img.src = 'https://image.ibb.co/mQXVKy/placeholder.png';
        img.onload = () => connectDragPreview(img);
      }
    render() {
        const { draggingId, isDragItem, isDragging } = this.props;

        const componentStyle = {
            backgroundColor: isDragging ? '#a5d8ff' : '#4dabf7'
        };
        const componentClasses = classnames('board__item', {
        });

        return (
            this.props.connectDragSource(
                <div className={componentClasses} style={componentStyle}>
                    {this.props.children}
                </div>,
                { dropEffect: 'copy' }
            )
        );
    }
}