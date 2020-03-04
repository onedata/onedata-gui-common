/**
 * @module utils/one-dynamic-tree/sample-tree-definition
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default [{
    name: 'node1',
    text: 'Node 1',
    subtree: [{
        name: 'node11',
        text: 'Node 1.1',
        field: {
          type: 'text',
          defaultValue: 'someDefault',
          tip: 'Some tip',
        },
      },
      {
        name: 'node12',
        text: 'Node a1.2',
        field: {
          type: 'radio-group',
          options: [
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ],
          defaultValue: '1',
        },
      },
      {
        name: 'node13',
        text: 'Node 1.3',
      },
    ],
  },
  {
    name: 'node2',
    text: 'Node 2',
    subtree: [{
        name: 'node21',
        text: 'Node 2.1',
        field: {
          name: 'node21',
          type: 'checkbox',
          defaultValue: true,
          optional: true,
        },
      },
      {
        name: 'node22',
        text: 'Node 2.2',
        subtree: [{
          name: 'node221',
          text: 'Node 2.b',
          subtree: [{
            name: 'node2211',
            text: 'Node 2.2b',
            field: {
              type: 'text',
            },
          }],
        }],
      },
      {
        name: 'node23',
        text: 'Node 2.3',
      },
    ],
  },
  {
    name: 'node3',
    text: 'Node 3',
    allowSubtreeCheckboxSelect: true,
    subtree: [{
        name: 'node31',
        text: 'Node 3.1',
        field: {
          type: 'checkbox',
          defaultValue: false,
          optional: true,
        },
      },
      {
        name: 'node32',
        text: 'Node 3.2',
        field: {
          type: 'checkbox',
          defaultValue: false,
          optional: true,
        },
      },
    ],
  },
];
