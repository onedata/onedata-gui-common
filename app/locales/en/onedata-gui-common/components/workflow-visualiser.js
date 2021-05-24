export default {
  lane: {
    actions: {
      createLane: {
        newLaneName: 'Untitled lane',
      },
      moveLeftLane: {
        title: 'Move left',
      },
      moveRightLane: {
        title: 'Move right',
      },
      clearLane: {
        title: 'Clear',
        modalHeader: 'Clear lane',
        modalDescription: 'You are about to clear the lane "{{laneName}}".',
        modalYes: 'Clear',
      },
      removeLane: {
        title: 'Remove',
        modalHeader: 'Remove lane',
        modalDescription: 'You are about to delete the lane "{{laneName}}".',
        modalYes: 'Remove',
      },
    },
  },
  parallelBlock: {
    actions: {
      createBlock: {
        newParallelBlockName: 'Parallel block',
      },
      moveUpBlock: {
        title: 'Move up',
      },
      moveDownBlock: {
        title: 'Move down',
      },
      removeBlock: {
        title: 'Remove',
        modalHeader: 'Remove parallel block',
        modalDescription: 'You are about to delete the parallel block "{{parallelBlockName}}".',
        modalYes: 'Remove',
      },
    },
  },
  task: {
    actions: {
      createTask: {
        newTaskName: 'Untitled task',
      },
      removeTask: {
        title: 'Remove',
        modalHeader: 'Remove task',
        modalDescription: 'You are about to delete the task "{{taskName}}".',
        modalYes: 'Remove',
      },
    },
  },
  store: {
    actions: {
      createStore: {
        title: 'Add store',
      },
      removeStore: {
        title: 'Remove',
        modalHeader: 'Remove store',
        modalDescription: 'You are about to delete the store "{{storeName}}".',
        modalYes: 'Remove',
      },
    },
  },
};
