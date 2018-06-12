import React, { Component } from 'react';

const componentStyle = {
    width: '300px',
    display: 'flex'
};

export default class extends Component {
    render() {
        return (
             <div style={componentStyle}>
                {this.props.children}
            </div>
        );
    }
}