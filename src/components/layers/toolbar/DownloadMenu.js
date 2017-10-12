import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import NavigationArrowIcon from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { grey600 } from 'material-ui/styles/colors';
import FileSaver from 'file-saver'; // https://github.com/eligrey/FileSaver.js
import { createSld } from '../../../util/sld';

const styles = {
    icon: {
        margin: 4,
    },
    menuItem: {
        lineHeight: '32px',
        minHeight: 32,
        fontSize: 14,
    },
};

// TODO: Use layer name rather than id as file name
const downloadGeoJson = ({ id, data }) => {
    const geojson = {
        type: 'FeatureCollection',
        features: data,
    };

    const blob = new Blob([JSON.stringify(geojson)], {type: 'application/json;charset=utf-8'});

    FileSaver.saveAs(blob, id + '.geojson');
};

const downloadStyle = ( id ) => {
    const sld = createSld(); // TODO: Make generic
    const blob = new Blob([sld], {type: 'application/xml;charset=utf-8'});

    FileSaver.saveAs(blob, id + '.sld');
};

const DownloadMenu = ({ id, data }) => (
    <MenuItem
        primaryText='Download ...'
        rightIcon={<NavigationArrowIcon color={grey600} style={styles.icon} />}
        menuItems={[
            <MenuItem
                primaryText='Organisation units (GeoJSON)'
                onTouchTap={() => downloadGeoJson(id, data)}
                style={styles.menuItem}
            />,
            <MenuItem
                primaryText='Style (SLD)'
                onTouchTap={() => downloadStyle(id)}
                style={styles.menuItem}
            />,
        ]}
        style={styles.menuItem}
    />
);

DownloadMenu.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.array,
};

export default DownloadMenu;