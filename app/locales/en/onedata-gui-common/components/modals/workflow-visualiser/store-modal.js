import storeForm from './store-modal/store-form';
import storeContentTable from './store-modal/store-content-table';

export default {
  storeForm,
  storeContentTable,
  header: {
    create: 'Create new store',
    edit: 'Modify store',
    view: {
      store: 'Store details',
      taskAuditLog: 'Task audit log',
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
    taskAuditLog: 'Audit log is empty',
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
