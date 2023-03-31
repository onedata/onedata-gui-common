export default {
  header: 'Remove store',
  body: {
    main: 'You are about to delete the store <strong>{{storeName}}</strong>.',
    referencingRecordsIntro: 'However, it is referenced by other schema elements:',
    areYouSure: 'If you proceed, you will have to manually adjust their configuration. Are you sure?',
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
