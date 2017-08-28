export default [
  {
    name: 'node1',
    text: 'Node 1',
    subtree: [
      {
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
        text: 'Node 1.2',
        field: {
          type: 'radio-group',
          options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ],
          defaultValue: '1',
        }
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
    subtree: [
      {
        name: 'node21',
        text: 'Node 2.1',
        field: {
          name: 'node21',
          type: 'checkbox',
          defaultValue: true,
          optional: true
        },
      },
      {
        name: 'node22',
        text: 'Node 2.2',
        subtree: [
          {
            name: 'node221',
            text: 'Node 2.2.1',
            field: {
              type: 'text',
            },
          }
        ]
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
    subtree: [
      {
        name: 'node31',
        text: 'Node 3.1',
        field: {
          type: 'checkbox',
          defaultValue: false,
          optional: true
        },
      },
      {
        name: 'node32',
        text: 'Node 3.2',
        subtree: [
          {
            name: 'node321',
            text: 'Node 3.2.1',
            field: {
              type: 'checkbox',
              defaultValue: false,
              optional: true
            },
          }
        ]
      },
    ],
  },
]
