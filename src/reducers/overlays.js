import * as types from '../constants/actionTypes';

const defaultOverlays = [{
    type: 'event',
    title: 'Events',
    img: 'images/layers/events.png',
    opacity: 0.95,
},{
    type: 'facility',
    title: 'Facilities',
    img: 'images/layers/facilities.png',
    opacity: 1,
},{
    type: 'thematic',
    title: 'Thematic',
    img: 'images/layers/thematic.png',
    opacity: 0.8,
},{
    type: 'boundary',
    title: 'Boundaries',
    img: 'images/layers/boundaries.png',
    opacity: 1,
},{
    type: 'earthEngine',
    title: 'Population density',
    img: 'images/layers/population.png',
    subtitle: '2010',
    opacity: 0.9,
},{
    type: 'earthEngine',
    title: 'Elevation',
    img: 'images/layers/elevation.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    title: 'Temperature',
    img: 'images/layers/temperature.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    title: 'Landcover',
    img: 'images/layers/landcover.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    title: 'Precipitation',
    img: 'images/layers/precipitation.png',
    subtitle: '26 - 28 Nov. 2016',
    opacity: 0.9,
},{
    type: 'earthEngine',
    title: 'Nighttime lights',
    img: 'images/layers/nighttime.png',
    opacity: 0.9,
}];

const overlays = (state = defaultOverlays, action) => {

    switch (action.type) {

        case types.EXTERNAL_OVERLAY_ADD:
            return [
                ...state,
                action.payload,
            ];

        case types.EXTERNAL_OVERLAY_REMOVE:
            return state.filter(overlay => overlay.id !== action.id);

        default:
            return state

    }
};

export default overlays;