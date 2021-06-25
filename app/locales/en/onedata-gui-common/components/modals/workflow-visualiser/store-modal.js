import storeForm from './store-modal/store-form';
import storeContentTable from './store-modal/store-content-table';

export default {
  storeForm,
  storeContentTable,
  header: {
    create: 'Create new store',
    edit: 'Modify store',
    view: 'Store details',
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
