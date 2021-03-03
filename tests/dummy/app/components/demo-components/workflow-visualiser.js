import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  rawDump: computed(() => [{
      id: 'l0',
      type: 'lane',
      name: 'lane0',
      tasks: [{
          id: 'b0.0',
          type: 'parallelBlock',
          name: 'block0.0',
          tasks: [{
              id: 't0.0.0',
              type: 'task',
              name: 'task0.0.0',
              progressPercent: 2,
            },
            {
              id: 't0.0.1',
              type: 'task',
              name: 'task0.0.1',
              progressPercent: 20,
            },
            {
              id: 't0.0.2',
              type: 'task',
              name: 'task0.0.2',
              progressPercent: 50,
            },
            {
              id: 't0.0.3',
              type: 'task',
              name: 'task0.0.3',
              progressPercent: 99,
            },
          ],
        },
        {
          id: 'b0.1',
          type: 'parallelBlock',
          name: 'block0.1',
          tasks: [{
              id: 't0.1.0',
              type: 'task',
              name: 'task0.1.0',
            },
            {
              id: 't0.1.1',
              type: 'task',
              name: 'task0.1.1',
            },
            {
              id: 't0.1.2',
              type: 'task',
              name: 'task0.1.2',
            },
            {
              id: 't0.1.3',
              type: 'task',
              name: 'task0.1.3',
            },
          ],
        },
        {
          id: 'b0.2',
          type: 'parallelBlock',
          name: 'block0.2',
          tasks: [{
              id: 't0.2.0',
              type: 'task',
              name: 'task0.2.0',
            },
            {
              id: 't0.2.1',
              type: 'task',
              name: 'task0.2.1',
            },
            {
              id: 't0.2.2',
              type: 'task',
              name: 'task0.2.2',
            },
            {
              id: 't0.2.3',
              type: 'task',
              name: 'task0.2.3',
            },
          ],
        },
        {
          id: 'b0.3',
          type: 'parallelBlock',
          name: 'block0.3',
          tasks: [{
              id: 't0.3.0',
              type: 'task',
              name: 'task0.3.0',
            },
            {
              id: 't0.3.1',
              type: 'task',
              name: 'task0.3.1',
            },
            {
              id: 't0.3.2',
              type: 'task',
              name: 'task0.3.2',
            },
            {
              id: 't0.3.3',
              type: 'task',
              name: 'task0.3.3',
            },
          ],
        },
      ],
    },
    {
      id: 'l1',
      type: 'lane',
      name: 'lane1',
      tasks: [{
          id: 'b1.0',
          type: 'parallelBlock',
          name: 'block1.0',
          tasks: [{
              id: 't1.0.0',
              type: 'task',
              name: 'task1.0.0',
            },
            {
              id: 't1.0.1',
              type: 'task',
              name: 'task1.0.1',
            },
            {
              id: 't1.0.2',
              type: 'task',
              name: 'task1.0.2',
            },
            {
              id: 't1.0.3',
              type: 'task',
              name: 'task1.0.3',
            },
          ],
        },
        {
          id: 'b1.1',
          type: 'parallelBlock',
          name: 'block1.1',
          tasks: [{
              id: 't1.1.0',
              type: 'task',
              name: 'task1.1.0',
            },
            {
              id: 't1.1.1',
              type: 'task',
              name: 'task1.1.1',
            },
            {
              id: 't1.1.2',
              type: 'task',
              name: 'task1.1.2',
            },
            {
              id: 't1.1.3',
              type: 'task',
              name: 'task1.1.3',
            },
          ],
        },
        {
          id: 'b1.2',
          type: 'parallelBlock',
          name: 'block1.2',
          tasks: [{
              id: 't1.2.0',
              type: 'task',
              name: 'task1.2.0',
            },
            {
              id: 't1.2.1',
              type: 'task',
              name: 'task1.2.1',
            },
            {
              id: 't1.2.2',
              type: 'task',
              name: 'task1.2.2',
            },
            {
              id: 't1.2.3',
              type: 'task',
              name: 'task1.2.3',
            },
          ],
        },
        {
          id: 'b1.3',
          type: 'parallelBlock',
          name: 'block1.3',
          tasks: [{
              id: 't1.3.0',
              type: 'task',
              name: 'task1.3.0',
            },
            {
              id: 't1.3.1',
              type: 'task',
              name: 'task1.3.1',
            },
            {
              id: 't1.3.2',
              type: 'task',
              name: 'task1.3.2',
            },
            {
              id: 't1.3.3',
              type: 'task',
              name: 'task1.3.3',
            },
          ],
        },
      ],
    },
    {
      id: 'l2',
      type: 'lane',
      name: 'lane2',
      tasks: [{
          id: 'b2.0',
          type: 'parallelBlock',
          name: 'block2.0',
          tasks: [{
              id: 't2.0.0',
              type: 'task',
              name: 'task2.0.0',
            },
            {
              id: 't2.0.1',
              type: 'task',
              name: 'task2.0.1',
            },
            {
              id: 't2.0.2',
              type: 'task',
              name: 'task2.0.2',
            },
            {
              id: 't2.0.3',
              type: 'task',
              name: 'task2.0.3',
            },
          ],
        },
        {
          id: 'b2.1',
          type: 'parallelBlock',
          name: 'block2.1',
          tasks: [{
              id: 't2.1.0',
              type: 'task',
              name: 'task2.1.0',
            },
            {
              id: 't2.1.1',
              type: 'task',
              name: 'task2.1.1',
            },
            {
              id: 't2.1.2',
              type: 'task',
              name: 'task2.1.2',
            },
            {
              id: 't2.1.3',
              type: 'task',
              name: 'task2.1.3',
            },
          ],
        },
        {
          id: 'b2.2',
          type: 'parallelBlock',
          name: 'block2.2',
          tasks: [{
              id: 't2.2.0',
              type: 'task',
              name: 'task2.2.0',
            },
            {
              id: 't2.2.1',
              type: 'task',
              name: 'task2.2.1',
            },
            {
              id: 't2.2.2',
              type: 'task',
              name: 'task2.2.2',
            },
            {
              id: 't2.2.3',
              type: 'task',
              name: 'task2.2.3',
            },
          ],
        },
        {
          id: 'b2.3',
          type: 'parallelBlock',
          name: 'block2.3',
          tasks: [{
              id: 't2.3.0',
              type: 'task',
              name: 'task2.3.0',
            },
            {
              id: 't2.3.1',
              type: 'task',
              name: 'task2.3.1',
            },
            {
              id: 't2.3.2',
              type: 'task',
              name: 'task2.3.2',
            },
            {
              id: 't2.3.3',
              type: 'task',
              name: 'task2.3.3',
            },
          ],
        },
      ],
    },
    {
      id: 'l3',
      type: 'lane',
      name: 'lane3',
      tasks: [{
          id: 'b3.0',
          type: 'parallelBlock',
          name: 'block3.0',
          tasks: [{
              id: 't3.0.0',
              type: 'task',
              name: 'task3.0.0',
            },
            {
              id: 't3.0.1',
              type: 'task',
              name: 'task3.0.1',
            },
            {
              id: 't3.0.2',
              type: 'task',
              name: 'task3.0.2',
            },
            {
              id: 't3.0.3',
              type: 'task',
              name: 'task3.0.3',
            },
          ],
        },
        {
          id: 'b3.1',
          type: 'parallelBlock',
          name: 'block3.1',
          tasks: [{
              id: 't3.1.0',
              type: 'task',
              name: 'task3.1.0',
            },
            {
              id: 't3.1.1',
              type: 'task',
              name: 'task3.1.1',
            },
            {
              id: 't3.1.2',
              type: 'task',
              name: 'task3.1.2',
            },
            {
              id: 't3.1.3',
              type: 'task',
              name: 'task3.1.3',
            },
          ],
        },
        {
          id: 'b3.2',
          type: 'parallelBlock',
          name: 'block3.2',
          tasks: [{
              id: 't3.2.0',
              type: 'task',
              name: 'task3.2.0',
            },
            {
              id: 't3.2.1',
              type: 'task',
              name: 'task3.2.1',
            },
            {
              id: 't3.2.2',
              type: 'task',
              name: 'task3.2.2',
            },
            {
              id: 't3.2.3',
              type: 'task',
              name: 'task3.2.3',
            },
          ],
        },
        {
          id: 'b3.3',
          type: 'parallelBlock',
          name: 'block3.3',
          tasks: [{
              id: 't3.3.0',
              type: 'task',
              name: 'task3.3.0',
            },
            {
              id: 't3.3.1',
              type: 'task',
              name: 'task3.3.1',
            },
            {
              id: 't3.3.2',
              type: 'task',
              name: 'task3.3.2',
            },
            {
              id: 't3.3.3',
              type: 'task',
              name: 'task3.3.3',
            },
          ],
        },
      ],
    },
  ]),
});
