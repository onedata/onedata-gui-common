export default {
  header: 'Remove store',
  body: {
    main: 'You are about to delete the store <strong>{{storeName}}</strong>.',
    referencingRecordsIntro: 'It is used by the elements below:',
    areYouSure: 'These elements will require manual configuration adjustments after store removal. Are you sure?',
  },
  recordTypes: {
    lane: 'Lane',
    task: 'Task',
  },
  buttons: {
    cancel: 'Cancel',
    remove: 'Remove',
  },
};
