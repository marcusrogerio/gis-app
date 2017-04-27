import * as actionTypes from '../constants/actionTypes';
import {arrayMove} from 'react-sortable-hoc';

const defaultState = {
    bounds: [[-34.9, -18.7], [35.9, 50.2]],
    basemap: {
        id: 'osmLight',
        visible: true,
        expanded: false,
        opacity: 1,
        subtitle: 'Basemap',
    },
    overlays: [],
};


const basemap = (state, action) => {

    switch (action.type) {

        case actionTypes.BASEMAP_SELECTED:
            if (state.id === action.id) { // No change
                return state;
            }

            return {
                ...state,
                id: action.id,
            };

        case actionTypes.BASEMAP_CHANGE_OPACITY:
            return {
                ...state,
                opacity: action.opacity,
            };

        case actionTypes.BASEMAP_TOGGLE_EXPAND:
            return {
                ...state,
                expanded: !state.expanded,
            };

        case actionTypes.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                visible: !state.visible,
            };

        default:
            return state;

    }
};


const overlay = (state, action) => {

    switch (action.type) {

        case actionTypes.OVERLAY_LOAD_REQUESTED:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                isLoading: true,
            };

        case actionTypes.OVERLAY_UPDATE:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...action.payload,
            };

        case actionTypes.OVERLAY_CHANGE_OPACITY:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                opacity: action.opacity,
            };

        case actionTypes.OVERLAY_TOGGLE_VISIBILITY:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                visible: !state.visible,
            };

        case actionTypes.OVERLAY_TOGGLE_EXPAND:
            if (state.id !== action.id) {
                return state;
            }

            return {
                ...state,
                expanded: !state.expanded,
            };

        case actionTypes.ORGANISATION_UNIT_SELECT:
        case actionTypes.ORGANISATION_UNIT_UNSELECT:
        case actionTypes.ORGANISATION_UNIT_COORDINATE_CHANGE:
            if (state.id !== action.layerId) {
                return state;
            }

            return {
                ...state,
                data: state.data.map(l => orgUnit(l, action))
            };

        case actionTypes.ORGANISATION_UNITS_FILTER:
            return {
                ...state,
                valueFilter: action.filter,
            };

        default:
            return state;

    }
};

const orgUnit = (state, action) => {

    switch (action.type) {
        case actionTypes.ORGANISATION_UNIT_SELECT:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                isSelected: true,
            };

        case actionTypes.ORGANISATION_UNIT_UNSELECT:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                isSelected: false,
            };

        case actionTypes.ORGANISATION_UNIT_COORDINATE_CHANGE:
            if (state.id !== action.featureId) {
                return state;
            }

            return {
                ...state,
                geometry: {
                    ...state.geometry,
                    coordinates: action.coordinate
                },
            };

        default:
            return state;

    }

};

const map = (state = defaultState, action) => {

    switch (action.type) {
        case actionTypes.MAP_SET:
            return {
                ...defaultState, // TODO: Not sure why needed
                ...action.payload
            };

        case actionTypes.MAP_COORDINATE_OPEN:
            return {
                ...state,
                coordinatePopup: action.payload,
            };

        case actionTypes.MAP_COORDINATE_CLOSE:
            return {
                ...state,
                coordinatePopup: null,
            };

        case actionTypes.BASEMAP_SELECTED:
        case actionTypes.BASEMAP_CHANGE_OPACITY:
        case actionTypes.BASEMAP_TOGGLE_EXPAND:
        case actionTypes.BASEMAP_TOGGLE_VISIBILITY:
            return {
                ...state,
                basemap: basemap(state.basemap, action),
            };

        case actionTypes.OVERLAY_ADD:
            return {
                ...state,
                overlays: [
                    action.payload,
                    ...state.overlays,
                ]
            };

        case actionTypes.OVERLAY_ADD_DATA:
            return {
                ...state,
            };

        case actionTypes.OVERLAY_LOAD:
            return {
                ...state,
            };

        case actionTypes.OVERLAY_REMOVE:
            return {
                ...state,
                overlays: state.overlays.filter(overlay => overlay.id !== action.id)
            };

        case actionTypes.OVERLAY_SORT:
            return {
                ...state,
                overlays: arrayMove(state.overlays, action.oldIndex, action.newIndex)
            };

        case actionTypes.OVERLAY_LOAD_REQUESTED:
        case actionTypes.OVERLAY_UPDATE:
        case actionTypes.OVERLAY_EDIT:
        case actionTypes.OVERLAY_CHANGE_OPACITY:
        case actionTypes.OVERLAY_TOGGLE_VISIBILITY:
        case actionTypes.OVERLAY_TOGGLE_EXPAND:
        case actionTypes.ORGANISATION_UNIT_SELECT:
        case actionTypes.ORGANISATION_UNIT_UNSELECT:
        case actionTypes.ORGANISATION_UNIT_COORDINATE_CHANGE:
        case actionTypes.ORGANISATION_UNITS_FILTER:
            return {
                ...state,
                overlays: state.overlays.map(l => overlay(l, action))
            };

        default:
            return state;

    }
};

export default map;