import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import sortBy from 'lodash/fp/sortBy';
import * as types from '../constants/actionTypes';
import { setDataElementGroups, setDataElements } from '../actions/dataElements';
import { errorActionCreator } from '../actions/helpers';

// Load all data element groups
export const loadDataElementGroups = (action$) =>
    action$
        .ofType(types.DATA_ELEMENT_GROUPS_LOAD)
        .concatMap(() =>
            getD2()
                .then(d2 => d2.models.dataElementGroups.list({
                    fields: 'id,displayName~rename(name)', // TODO: id,' + namePropertyUrl + '&paging=false'),
                    paging: false,
                }))
                .then(groups => setDataElementGroups(sortBy('name', groups.toArray())))
                .catch(errorActionCreator(types.PROGRAMS_LOAD_ERROR))
        );

// Load data elements in one group
export const loadDataElements = (action$) =>
    action$
        .ofType(types.DATA_ELEMENTS_LOAD)
        .concatMap((action) =>
            getD2()
                .then(d2 => {
                    // TODO: Load data elements not belonging to a group
                    return d2.models.dataElements
                        .filter().on('dataElementGroups.id').equals(action.groupId)
                        .list({
                            fields: 'dimensionItem~rename(id),displayName~rename(name)', // TODO: gis.init.namePropertyUrl
                            domainType: 'aggregate',
                            paging: false,
                        });
                    })
                .then(dataElements => setDataElements(action.groupId, dataElements.toArray()))
                .catch(errorActionCreator(types.DATA_ELEMENTS_LOAD_ERROR))
        );


export default combineEpics(loadDataElementGroups, loadDataElements);


/*
if (isString(uid)) {
    path = '/dataElements.json?fields=dimensionItem~rename(id),' + gis.init.namePropertyUrl + '&domainType=aggregate&paging=false&filter=dataElementGroups.id:eq:' + uid;
}
else if (uid === 0) {
    path = '/dataElements.json?fields=dimensionItem~rename(id),' + gis.init.namePropertyUrl + '&domainType=aggregate&paging=false';
}
*/