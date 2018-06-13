import { normalCanDrop, updateNormalItemsPosition } from './normal';
import { ghostCanDrop, updateGhostItemsPosition } from './ghost';

export const canDrop = (params) => {
    let result;
    console.log(params.dropCell.isRowGhost)
    if (params.dropCell.isRowGhost) {
        result = ghostCanDrop(params);
    } else {
        result = normalCanDrop(params);
    }

    return result;
};

export const updatePosition = (params) => {
    let items;

    if (params.dropItem.isRowGhost) {
        items = updateGhostItemsPosition(params);
    } else {
        items = updateNormalItemsPosition(params);
    }

    return items;
};