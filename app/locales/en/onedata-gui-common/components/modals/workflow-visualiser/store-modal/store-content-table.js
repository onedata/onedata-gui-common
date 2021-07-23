import tableHeader from './store-content-table/table-header';

export default {
  tableHeader,
  columns: {
    value: 'Value',
  },
  tableRow: {
    storeAccessError: 'Cannot fetch entry due to error',
    unknownError: 'Unknown error',
    entryExpanderTip: {
      expanded: 'Hide details',
      collapsed: 'Show details',
    },
  },
};
