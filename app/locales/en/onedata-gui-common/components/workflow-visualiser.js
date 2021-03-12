export default {
  nameForNew: {
    lane: 'Untitled lane',
    parallelBlock: 'Parallel block',
    task: 'Untitled task',
  },
  lane: {
    actions: {
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
      moveUpBlock: {
        title: 'Move up',
      },
      moveDownBlock: {
        title: 'Move down',
      },
      removeBlock: {
        title: 'Remove',
      },
    },
  },
  task: {
    actions: {
      removeTask: {
        title: 'Remove',
      },
    },
  },
};
