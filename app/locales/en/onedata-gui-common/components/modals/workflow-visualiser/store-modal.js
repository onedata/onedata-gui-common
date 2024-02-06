import storeForm from './store-modal/store-form';
import auditLogPresenter from './store-modal/audit-log-presenter';
import exceptionPresenter from './store-modal/exception-presenter';
import listPresenter from './store-modal/list-presenter';
import singleValuePresenter from './store-modal/single-value-presenter';
import visiblePropertiesSelector from './store-modal/visible-properties-selector';

export default {
  storeForm,
  auditLogPresenter,
  exceptionPresenter,
  listPresenter,
  singleValuePresenter,
  visiblePropertiesSelector,
  noContentDueToUnknownStoreType: 'Store content preview is not available due to unrecognized store type.',
  header: {
    create: 'Create new store',
    edit: 'Modify store',
    view: {
      task: {
        timeSeries: 'Task time series',
        auditLog: 'Task audit log',
      },
      workflow: {
        timeSeries: 'Workflow time series',
        auditLog: 'Workflow audit log',
      },
      any: {
        any: 'Store details',
      },
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
