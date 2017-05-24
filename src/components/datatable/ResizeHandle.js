import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DragIcon from 'material-ui/svg-icons/editor/drag-handle';
import { grey400 } from 'material-ui/styles/colors';

const ResizeHandle = ({ onResize, onResizeEnd, minHeight, maxHeight }) => {

    const onDragStart = (evt) => {
        // Set the drag ghost image to a transparent 1x1px
        // https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
        const img = document.createElement('img');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        evt.dataTransfer.setDragImage(img, 0, 0);
    };

    const onDrag = (evt) => {
        const height = getHeight(evt);
        if (height && onResize) {
            onResize(height);
        }
    };

    const onDragEnd = (evt) => {
        const height = getHeight(evt);
        if (height && onResizeEnd) {
            onResizeEnd(height);
        }
    };

    const getHeight = (evt) => {
        if (evt.pageY) {
            const height = window.innerHeight - evt.pageY;
            return height < minHeight ? minHeight : height > maxHeight ? maxHeight : height;
        }
    };

    return (
        <div
            draggable={true}
            onDragStart={(evt) => onDragStart(evt)}
            onDrag={(evt) => onDrag(evt)}
            onDragEnd={(evt) => onDragEnd(evt)}
            className='dhis-gis-resize-handle'
        >
            <DragIcon color={grey400} />
        </div>
    );
};

ResizeHandle.propTypes = {
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    minHeight: PropTypes.number.isRequired,
    maxHeight: PropTypes.number.isRequired,
};

ResizeHandle.defaultProps = {
    minHeight: 50,
    maxHeight: 500,
};

export default ResizeHandle;