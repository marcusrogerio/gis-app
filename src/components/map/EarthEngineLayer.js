import Layer from './Layer';
import { apiFetch } from '../../util/api';

export default class EarthEngineLayer extends Layer {
    createLayer() {
        const props = this.props;
        const map = this.context.map;

        /* TODO
         if (typeof view.config === 'string') { // From database as favorite
         view.config = JSON.parse(view.config);
         }
         */

        const config = {
            type: 'earthEngine',
            pane: props.id,
            id: props.datasetId,
            band: props.band,
            mask: props.mask,
            attribution: props.attribution,
            filter: props.filter,
            methods: props.methods,
            aggregation: props.aggregation,
        };

        if (props.params) {
            config.params = props.params;
        }

        config.accessToken = (callback) => {
            apiFetch('tokens/google')
                .then(response => response.json())
                .then(json => callback(json))
                .catch(error => console.log('parsing failed', error));
        };

        this.layer = map.createLayer(config);
    }
}