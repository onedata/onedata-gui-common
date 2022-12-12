export default {
  disabled: {
    header: 'Disable directory statistics',
    question: 'Are you sure you want to disable directory statistics? <strong>All collected information will be lost</strong> and it will no longer be possible to view directory sizes or distribution.',
    description: 'In case of subsequent re-enabling of the statistics, the whole space will need to be scanned, which may take a long time depending on its size.',
    buttonConfirm: 'Disable',
    cancel: 'Cancel',
  },
  enabled: {
    header: 'Enable directory statistics',
    question: 'Are you sure you want to enable directory statistics?',
    description: 'The whole space will be scanned, which will cause additional load on the provider and may take a long time depending on the space size.',
    buttonConfirm: 'Enable',
    cancel: 'Cancel',
  },
};
