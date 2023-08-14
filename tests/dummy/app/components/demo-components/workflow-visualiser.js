import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  rawDump: computed(() => ({
    lanes: [{
      id: 'l0',
      name: 'lane0',
      maxRetries: 1,
      failForExceptionsRatio: 0.1,
      storeIteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
      parallelBoxes: [{
        id: 'b0.0',
        name: 'block0.0',
        tasks: [{
          id: 't0.0.0',
          name: 'task0.0.0',
          status: null,
          progressPercent: 2,
        }, {
          id: 't0.0.1',
          name: 'task0.0.1',
          status: 'warning',
          progressPercent: 20,
        }, {
          id: 't0.0.2',
          name: 'task0.0.2',
          status: 'error',
          progressPercent: 50,
        }, {
          id: 't0.0.3',
          name: 'task0.0.3',
          status: 'success',
          progressPercent: 99,
        }],
      }, {
        id: 'b0.1',
        name: 'block0.1',
        tasks: [{
          id: 't0.1.0',
          name: 'task0.1.0',
        }, {
          id: 't0.1.1',
          name: 'task0.1.1',
        }, {
          id: 't0.1.2',
          name: 'task0.1.2',
        }, {
          id: 't0.1.3',
          name: 'task0.1.3',
        }],
      }, {
        id: 'b0.2',
        name: 'block0.2',
        tasks: [{
          id: 't0.2.0',
          name: 'task0.2.0',
        }, {
          id: 't0.2.1',
          name: 'task0.2.1',
        }, {
          id: 't0.2.2',
          name: 'task0.2.2',
        }, {
          id: 't0.2.3',
          name: 'task0.2.3',
        }],
      }, {
        id: 'b0.3',
        name: 'block0.3',
        tasks: [{
          id: 't0.3.0',
          name: 'task0.3.0',
        }, {
          id: 't0.3.1',
          name: 'task0.3.1',
        }, {
          id: 't0.3.2',
          name: 'task0.3.2',
        }, {
          id: 't0.3.3',
          name: 'task0.3.3',
        }],
      }],
    }, {
      id: 'l1',
      name: 'lane1',
      maxRetries: 5,
      failForExceptionsRatio: 0.2,
      storeIteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
      parallelBoxes: [{
        id: 'b1.0',
        name: 'block1.0',
        tasks: [{
          id: 't1.0.0',
          name: 'task1.0.0',
        }, {
          id: 't1.0.1',
          name: 'task1.0.1',
        }, {
          id: 't1.0.2',
          name: 'task1.0.2',
        }, {
          id: 't1.0.3',
          name: 'task1.0.3',
        }],
      }, {
        id: 'b1.1',
        name: 'block1.1',
        tasks: [{
          id: 't1.1.0',
          name: 'task1.1.0',
        }, {
          id: 't1.1.1',
          name: 'task1.1.1',
        }, {
          id: 't1.1.2',
          name: 'task1.1.2',
        }, {
          id: 't1.1.3',
          name: 'task1.1.3',
        }],
      }, {
        id: 'b1.2',
        name: 'block1.2',
        tasks: [{
          id: 't1.2.0',
          name: 'task1.2.0',
        }, {
          id: 't1.2.1',
          name: 'task1.2.1',
        }, {
          id: 't1.2.2',
          name: 'task1.2.2',
        }, {
          id: 't1.2.3',
          name: 'task1.2.3',
        }],
      }, {
        id: 'b1.3',
        name: 'block1.3',
        tasks: [{
          id: 't1.3.0',
          name: 'task1.3.0',
        }, {
          id: 't1.3.1',
          name: 'task1.3.1',
        }, {
          id: 't1.3.2',
          name: 'task1.3.2',
        }, {
          id: 't1.3.3',
          name: 'task1.3.3',
        }],
      }],
    }, {
      id: 'l2',
      name: 'lane2',
      maxRetries: 2,
      failForExceptionsRatio: 1,
      storeIteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
      parallelBoxes: [{
        id: 'b2.0',
        name: 'block2.0',
        tasks: [{
          id: 't2.0.0',
          name: 'task2.0.0',
        }, {
          id: 't2.0.1',
          name: 'task2.0.1',
        }, {
          id: 't2.0.2',
          name: 'task2.0.2',
        }, {
          id: 't2.0.3',
          name: 'task2.0.3',
        }],
      }, {
        id: 'b2.1',
        name: 'block2.1',
        tasks: [{
          id: 't2.1.0',
          name: 'task2.1.0',
        }, {
          id: 't2.1.1',
          name: 'task2.1.1',
        }, {
          id: 't2.1.2',
          name: 'task2.1.2',
        }, {
          id: 't2.1.3',
          name: 'task2.1.3',
        }],
      }, {
        id: 'b2.2',
        name: 'block2.2',
        tasks: [{
          id: 't2.2.0',
          name: 'task2.2.0',
        }, {
          id: 't2.2.1',
          name: 'task2.2.1',
        }, {
          id: 't2.2.2',
          name: 'task2.2.2',
        }, {
          id: 't2.2.3',
          name: 'task2.2.3',
        }],
      }, {
        id: 'b2.3',
        name: 'block2.3',
        tasks: [{
          id: 't2.3.0',
          name: 'task2.3.0',
        }, {
          id: 't2.3.1',
          name: 'task2.3.1',
        }, {
          id: 't2.3.2',
          name: 'task2.3.2',
        }, {
          id: 't2.3.3',
          name: 'task2.3.3',
        }],
      }],
    }, {
      id: 'l3',
      name: 'lane3',
      maxRetries: 0,
      failForExceptionsRatio: 0,
      parallelBoxes: [{
        id: 'b3.0',
        name: 'block3.0',
        tasks: [{
          id: 't3.0.0',
          name: 'task3.0.0',
        }, {
          id: 't3.0.1',
          name: 'task3.0.1',
        }, {
          id: 't3.0.2',
          name: 'task3.0.2',
        }, {
          id: 't3.0.3',
          name: 'task3.0.3',
        }],
      }, {
        id: 'b3.1',
        name: 'block3.1',
        tasks: [{
          id: 't3.1.0',
          name: 'task3.1.0',
        }, {
          id: 't3.1.1',
          name: 'task3.1.1',
        }, {
          id: 't3.1.2',
          name: 'task3.1.2',
        }, {
          id: 't3.1.3',
          name: 'task3.1.3',
        }],
      }, {
        id: 'b3.2',
        name: 'block3.2',
        tasks: [{
          id: 't3.2.0',
          name: 'task3.2.0',
        }, {
          id: 't3.2.1',
          name: 'task3.2.1',
        }, {
          id: 't3.2.2',
          name: 'task3.2.2',
        }, {
          id: 't3.2.3',
          name: 'task3.2.3',
        }],
      }, {
        id: 'b3.3',
        name: 'block3.3',
        tasks: [{
          id: 't3.3.0',
          name: 'task3.3.0',
        }, {
          id: 't3.3.1',
          name: 'task3.3.1',
        }, {
          id: 't3.3.2',
          name: 'task3.3.2',
        }, {
          id: 't3.3.3',
          name: 'task3.3.3',
        }],
      }],
    }],
    stores: [{
      id: 's1',
      name: 'store1',
      description: '',
      type: 'list',
      config: {
        itemDataSpec: {
          type: 'number',
        },
      },
      defaultInitialContent: undefined,
      requiresInitialContent: false,
    }, {
      id: 's2',
      name: 'store2',
      description: 'storeDesc',
      type: 'range',
      defaultInitialContent: {
        start: 1,
        end: 10,
        step: 2,
      },
      requiresInitialContent: false,
    }],
  })),
});
