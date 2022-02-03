import taskForm from './workflow-visualiser/task-form';

export default {
  status: 'Status',
  taskForm,
  lane: {
    iterator: 'Max. batch: {{maxBatchSize}}',
    runTiming: {
      latest: 'Latest run',
      past: 'Past run',
    },
    unknownStore: 'Unknown',
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
      viewLaneFailedItems: {
        title: 'View failed items',
        disabledTip: 'Failed items list is available only for a correctly started lane.',
      },
      retryLane: {
        title: 'Retry failed items',
        successNotificationText: 'Lane retry has been scheduled successfully.',
        failureNotificationActionName: 'scheduling lane retry',
        disabledTip: {
          workflowNotEnded: 'Retry can be scheduled only when the workflow execution is ended.',
          laneNotFailed: 'Retry can be scheduled only for a failed lane run.',
          noExceptionStoreAvailable: 'Retry can be scheduled only for a lane that has passed the preparation phase.',
          unknownReason: 'Retry of this lane run is not possible.',
        },
      },
      rerunLane: {
        title: 'Rerun all items',
        successNotificationText: 'Lane rerun has been scheduled successfully.',
        failureNotificationActionName: 'scheduling lane rerun',
        disabledTip: {
          workflowNotEnded: 'Rerun can be scheduled only when the workflow execution is ended.',
          preparedInAdvance: 'Rerun cannot be scheduled for runs prepared in advance.',
          unknownReason: 'Rerun of this lane run is not possible.',
        },
      },
    },
    runIndicator: {
      runType: {
        regular: 'regular',
        rerun: 'rerun',
        retry: 'retry',
      },
      tooltip: {
        runNumber: 'Run',
        originRunNumber: 'Origin run',
        runType: 'Run type',
        status: 'Status',
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
      modifyTask: {
        title: 'Modify',
      },
      removeTask: {
        title: 'Remove',
        modalHeader: 'Remove task',
        modalDescription: 'You are about to delete the task "{{taskName}}".',
        modalYes: 'Remove',
      },
      viewTaskAuditLog: {
        title: 'Audit log',
      },
      viewTaskPodsActivity: {
        title: 'Pods activity',
      },
    },
    details: {
      instanceId: 'Instance ID',
      status: 'Status',
      itemsInProcessing: 'In processing',
      itemsProcessed: 'Processed',
      itemsFailed: 'Failed',
      auditLog: 'Audit log',
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
      viewWorkflowAuditLog: {
        title: 'Audit log',
        auditLogSubjectName: 'Workflow',
      },
    },
  },
};
