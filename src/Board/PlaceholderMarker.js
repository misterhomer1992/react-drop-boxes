import React from 'react';

export default ({ type, top, left }) => {    
    const typeClassName = type === 'vr' ? 'board__vr-placeholder-marker' : 'board__hr-placeholder-marker';
    const styles = {
        top,
        left
    };

    return (
        <div style={styles} className={typeClassName}></div>
    );
}