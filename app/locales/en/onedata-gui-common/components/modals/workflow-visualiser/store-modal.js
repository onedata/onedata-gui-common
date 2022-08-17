import storeForm from './store-modal/store-form';
import timeSeriesPresenter from './store-modal/time-series-presenter';
import auditLogPresenter from './store-modal/audit-log-presenter';
import listPresenter from './store-modal/list-presenter';

export default {
  storeForm,
  timeSeriesPresenter,
  auditLogPresenter,
  listPresenter,
  noContentDueToUnknownStoreType: 'Store content preview is not available due to unrecognized store type.',
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
