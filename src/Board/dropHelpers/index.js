import { normalCanDrop, updateNormalItemsPosition } from './normal';
import { ghostCanDrop, updateGhostItemsPosition } from './ghost';
import { ghostCellCanDrop } from './ghostCell';

export const canDrop = (params) => {
    let result;

    if (params.dropCell.isRowGhost) {
        result = ghostCanDrop(params);
    } else if (params.dropCell.isCellGhost) {
        result = ghostCellCanDrop(params);
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