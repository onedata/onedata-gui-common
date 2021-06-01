import taskForm from './workflow-visualiser/task-form';

export default {
  taskForm,
  lane: {
    actions: {
      createLane: {
        newLaneName: 'Untitled lane',
      },
      modifyLane: {
        title: 'Modify',
      },
      viewLane: {
        title: 'View details',
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
  parallelBox: {
    actions: {
      createParallelBox: {
        newParallelBoxName: 'Parallel box',
      },
      moveUpParallelBox: {
        title: 'Move up',
      },
      moveDownParallelBox: {
        title: 'Move down',
      },
      removeParallelBox: {
        title: 'Remove',
        modalHeader: 'Remove parallel box',
        modalDescription: 'You are about to delete the parallel box "{{parallelBoxName}}".',
        modalYes: 'Remove',
      },
    },
  },
  task: {
    actions: {
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
