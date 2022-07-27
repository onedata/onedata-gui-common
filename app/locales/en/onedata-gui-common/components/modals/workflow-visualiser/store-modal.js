import storeForm from './store-modal/store-form';
import storeContentTable from './store-modal/store-content-table';
import timeSeriesPresenter from './store-modal/time-series-presenter';
import auditLogPresenter from './store-modal/audit-log-presenter';

export default {
  storeForm,
  storeContentTable,
  timeSeriesPresenter,
  auditLogPresenter,
  header: {
    create: 'Create new store',
    edit: 'Modify store',
    view: {
      store: 'Store details',
      auditLog: '{{subjectName}} audit log',
      timeSeries: '{{subjectName}} time series',
    },
  },
  tabs: {
    details: {
      title: 'Details',
    },
    content: {
      title: 'Content',
    },
  },
  emptyStore: {
    store: 'Store is empty.',
    auditLog: 'Audit log is empty.',
  },
  button: {
    refresh: 'Refresh',
    cancel: {
      create: 'Cancel',
      edit: 'Cancel',
      view: 'Close',
    },
    submit: {
      create: 'Create',
      edit: 'OK',
    },
  },
};
