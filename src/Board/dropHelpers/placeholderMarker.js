const markerHeight = 2; //px

export const getHrPlaceholderMarkerPosition = ({ elementBoundingRect, cellBoundingRect }) => {
    const top = cellBoundingRect.top +
        (cellBoundingRect.height / 2)
        - markerHeight
        - elementBoundingRect.top;

    return top;
};

export const getVrPlaceholderMarkerPosition = ({ elementBoundingRect, cellBoundingRect, direction, isItemExist }) => {
    const top = cellBoundingRect.top +
        - elementBoundingRect.top;

    const directionMargin = direction === 'LEFT' || !isItemExist ? - 10 : cellBoundingRect.width + 10;
    const left = cellBoundingRect.left + directionMargin - elementBoundingRect.left;

    return {
        top,
        left
    };
};