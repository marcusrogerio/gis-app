import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Layer from './Layer';
import EventLayer from './EventLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';

const layerType = {
    event:       EventLayer,
    facility:    FacilityLayer,
    thematic:    ThematicLayer,
    boundary:    BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external:    ExternalLayer
};

class Map extends Component {

    static contextTypes = {
        map: PropTypes.object,
    };

    componentWillMount() {
        console.log('map componentWillMount');

        this.map = this.context.map;
        this.map.on('contextmenu', this.onRightClick, this);
    }

    componentDidMount() {
        const props = this.props;

        // Append map container to DOM
        this.node.appendChild(this.map.getContainer());

        if (props.bounds) {
            this.map.fitBounds(props.bounds);
        } else if (props.latitude && props.longitude && props.zoom) {
            this.map.setView([props.latitude, props.longitude], props.zoom);
        }

        console.log('map componentDidMount');
    }

    componentDidUpdate(prevProps) {
        console.log('map componentDidUpdate');

        const props = this.props;

        // console.log('componentDidUpdate', props);

        if (props.coordinatePopup) {
            this.showCoordinate(props.coordinatePopup);
        }

        this.map.invalidateSize();
    }

    // Remove map
    componentWillUnmount() {
        console.log('map componentWillUnmount');
        this.map.remove();
    }

    showCoordinate(coord) {
        L.popup()
            .setLatLng([coord[1], coord[0]])
            .setContent('Longitude: ' + coord[0].toFixed(6) + '<br />Latitude: ' + coord[1].toFixed(6))
            .on('remove', this.props.closeCoordinatePopup)
            .openOn(this.map);
    }

    onRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        const latlng = evt.latlng;
        const position = [evt.originalEvent.x, evt.originalEvent.pageY || evt.originalEvent.y];

        this.props.openContextMenu({
            position,
            coordinate: [latlng.lng, latlng.lat],
        });
    }

    render() {
        const props = this.props;
        const basemap = {
            ...props.basemaps.filter(b => b.id === props.basemap.id)[0],
            ...props.basemap
        };
        const style = {
            position: 'absolute',
            top: 40,
            left: props.ui.layersPanelOpen ? 300 : 0,
            right: 0,
            bottom: props.ui.dataTableOpen ? 200 : 0,
        };


        return (
            <div ref={node => this.node = node} style={style}>
                {props.overlays.filter(layer => layer.isLoaded).map((layer, index) => {
                    const Overlay = layerType[layer.type] || Layer;

                    return (
                        <Overlay
                            key={layer.id}
                            index={index}
                            {...layer}
                            openContextMenu={props.openContextMenu}
                        />
                    )
                })}
                <Layer {...basemap} key='basemap' />
            </div>
        )
    }
}

export default Map;

