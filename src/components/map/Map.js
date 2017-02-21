import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import d2map from 'gis-api/src/';
import Layer from './Layer';

const style = {
    width: '100%',
    height: '100%',
}

class Map extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const props = this.props;

        this.mapEl = ReactDOM.findDOMNode(this.refs.map);
        this.map = d2map(this.mapEl);

        /*
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        */

        this.map.setView([props.latitude, props.longitude], props.zoom);
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log('map componentDidUpdate', prevProps, prevState);
    }

    render() {
        return (
            <div ref="map" style={style}>
                {this.props.layers.map((layer, index) =>
                    <Layer
                        {...layer}
                        key={`layer-${index}`}
                        index={index}
                        map={this.map}
                    />
                )}
            </div>
        )
    }

}


export default Map;
