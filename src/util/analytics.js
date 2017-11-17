import i18next from 'i18next';
import { relativePeriods } from '../constants/periods';

export const getOrgUnitsFromRows = (rows) => {
    if (!Array.isArray(rows)) {
        return null;
    }

    const orgUnits = rows.filter(item => item.dimension === 'ou')[0];
    return (orgUnits && orgUnits.items) ? orgUnits.items : null;
};

export const getDataItemsFromColumns = (columns) => {
  if (!Array.isArray(columns)) {
    return null;
  }

  const dataItems = columns.filter(item => item.dimension === 'dx')[0];
  return (dataItems && dataItems.items) ? dataItems.items : null;
};

export const getPeriodsFromFilters = (filters) => {
  if (!Array.isArray(filters)) {
    return null;
  }

  const period = filters.filter(item => item.dimension === 'pe')[0];
  return (period && period.items) ? period.items : null;
};

export const getPeriodNameFromFilters = (filters) => {
    if (!Array.isArray(filters)) {
        return null;
    }

    const periods = getPeriodsFromFilters(filters);
    return periods ? getPeriodNameFromId(periods[0].id) : null;
};

export const getPeriodNameFromId = (id) => {
    const period = relativePeriods.filter(period => period.id === id)[0];
    return period ? i18next.t(period.name) : null;
};

export const getFiltersFromColumns = (columns) => {
  if (!Array.isArray(columns)) {
    return null;
  }

  const filters = columns.filter(item => item.filter);
  return filters.length ? filters : null;
};

// TODO: Remove dependancy to global variables
export const getDimensionIndexFromHeaders = (headers, dimension) => {
  if (!Array.isArray(headers) || !dimension) {
    return null;
  }

  const dim = gis.conf.finals.dimension[dimension];

  if (!dim) {
      return null;
  }

  // TODO: findIndex is not supported by IE, is it transpiled?
  return headers.findIndex(item => item.name === dim.dimensionName);
};



// TODO: Remove dependancy to global variables
export const getDisplayProperty = (displayProperty) => {
  const propertyMap = {
    'name': 'name',
    'displayName': 'name',
    'shortName': 'shortName',
    'displayShortName': 'shortName'
  };
  const keyAnalysisDisplayProperty = gis.init.userAccount.settings.keyAnalysisDisplayProperty;
  return propertyMap[keyAnalysisDisplayProperty] || propertyMap[displayProperty] || 'name';
};

export const getFiltersAsText = (filters) => {
  if (!Array.isArray(filters)) {
    return null;
  }

  return filters.map(({ name, filter }) => {
    const [ operator, value ] = filter.split(':');
    return `${name} ${getFilterOperatorAsText(operator)} ${value}`;
  });
};

// TODO: Cache?
export const getFilterOperatorAsText = (id) => ({
  'EQ': '=',
  'GT': '>',
  'GE': '>=',
  'LT': '<',
  'LE': '<=',
  'NE': '!=',
  'IN': i18next.t('one of'),
  '!IN': i18next.t('not one of'),
  'LIKE': i18next.t('contains'),
  '!LIKE': i18next.t('doesn\'t contains'),
}[id]);


