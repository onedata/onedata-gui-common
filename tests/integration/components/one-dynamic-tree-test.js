import EmberObject from '@ember/object';
import { A } from '@ember/array';
import {
  expect,
} from 'chai';
import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import {
  setupRenderingTest,
} from 'ember-mocha';
import {
  render,
  settled,
  focus,
  blur,
  click,
  fillIn,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

const ERROR_MSG = 'error!';

describe('Integration | Component | one dynamic tree', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('definition', [{
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
            text: 'Node 1.2',
            field: {
              type: 'radio-group',
              options: [{
                  value: '1',
                  label: '1',
                },
                {
                  value: '2',
                  label: '2',
                },
                {
                  value: '3',
                  label: '3',
                },
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
        allowSubtreeCheckboxSelect: true,
        subtree: [{
            name: 'node21',
            text: 'Node 2.1',
            field: {
              type: 'checkbox',
              defaultValue: false,
            },
          },
          {
            name: 'node22',
            text: 'Node 2.2',
            field: {
              type: 'checkbox',
              defaultValue: true,
            },
          },
        ],
      },
    ]);
    this.set('values', {
      node1: {
        node11: 'someDefault',
        node12: '1',
      },
      node2: {
        node21: false,
        node22: true,
      },
    });
    this.set('validations', EmberObject.create({
      errors: [
        EmberObject.create({
          attribute: 'values.node1.node11',
          message: ERROR_MSG,
        }),
      ],
    }));
  });

  it('renders fields', async function () {
    await render(hbs `{{one-dynamic-tree definition=definition}}`);

    expect(find('.field-node1-node11'), 'node 1.1').to.exist;
    expect(find('.field-node1-node12'), 'node 1.2').to.exist;
    expect(find('input[type="text"]')).to.exist;
    expect(find('.one-way-radio-group')).to.exist;
  });

  it('disables field', async function () {
    this.set('disabledPaths', A(['node1.node11']));
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        disabledFieldsPaths=disabledPaths
      }}
    `);

    expect(find('.field-node1-node11').disabled).to.be.true;
    expect(find('.field-node1-node12 input[type="radio"]').disabled).to.be.false;
  });

  it('disables nested field', async function () {
    this.set('disabledPaths', A(['node1']));
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        disabledFieldsPaths=disabledPaths
      }}
    `);

    expect(find('.field-node1-node11').disabled).to.be.true;
    expect(find('.field-node1-node12 input[type="radio"]').disabled).to.be.true;
  });

  it('validates data', async function () {
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        validations=validations
      }}
    `);

    expect(find('.has-error')).to.not.exist;

    await focus('input[type="text"]');
    await blur('input[type="text"]');
    expect(find('.has-error')).to.exist;
    expect(find('.has-error .form-message').textContent).to.contain(ERROR_MSG);
  });

  it('does not validate data in disabled fields', async function () {
    this.set('disabledPaths', A());
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        validations=validations
        disabledFieldsPaths=disabledPaths
      }}
    `);

    await focus('input[type="text"]');
    await blur('input[type="text"]');
    expect(find('.has-error')).to.exist;

    this.get('disabledPaths').pushObject('node1.node11');
    await settled();
    expect(find('.has-error')).to.not.exist;

  });

  it('allows data change', async function () {
    const newTextValue = 'text';
    const valuesChangedHandler = sinon.spy();

    this.set('valuesChanged', valuesChangedHandler);
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        valuesChanged=(action valuesChanged)
      }}
    `);

    await fillIn('input[type="text"]', newTextValue);

    const newValues = this.get('values');
    newValues.node1.node11 = newTextValue;
    expect(valuesChangedHandler).calledWithExactly(newValues, true);
  });

  it(
    'marks "select all" toggle as semi-checked when not all nested toggles are checked',
    async function () {
      await render(hbs `{{one-dynamic-tree definition=definition}}`);

      expect(find('.field-node2')).to.have.class('maybe');
    }
  );

  it('allows to select all nested checkbox fields', async function () {
    await render(hbs `{{one-dynamic-tree definition=definition}}`);

    await click('.field-node2');

    expect(find('.field-node2-node21')).to.have.class('checked');
    expect(find('.field-node2-node22')).to.have.class('checked');
    expect(find('.field-node2')).to.have.class('checked');
  });

  it('does not ignore disabled toggle state in "select all" toggle state',
    async function () {
      this.set('disabledPaths', A(['node2.node21']));
      await render(hbs `
        {{one-dynamic-tree
          definition=definition
          disabledFieldsPaths=disabledPaths
        }}
      `);

      expect(find('.field-node2')).to.have.class('maybe');
    }
  );

  it('ignores disabled toggle on "select all" toggle change',
    async function () {
      this.set('disabledPaths', A(['node2.node22']));
      await render(hbs `
        {{one-dynamic-tree
          definition=definition
          disabledFieldsPaths=disabledPaths
        }}
      `);

      const node21Field = find('.field-node2-node21');
      const node22Field = find('.field-node2-node22');
      await click('.field-node2');
      expect(node21Field).to.have.class('checked');
      expect(node22Field).to.have.class('checked');

      await click('.field-node2');
      expect(node21Field).to.not.have.class('checked');
      expect(node22Field).to.have.class('checked');
    }
  );

  it('allows to override tree values', async function () {
    let treeValues;
    this.set('overrideValues', undefined);
    this.set('valuesChanged', (values) => {
      if (!treeValues) {
        treeValues = values;
      }
    });
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        overrideValues=overrideValues
        valuesChanged=(action valuesChanged)
      }}
    `);

    const overrideValue = 'override';
    await fillIn('.field-node1-node11', 'test');
    treeValues.node1.node11 = overrideValue;
    this.set('overrideValues', treeValues);
    await settled();
    expect(find('.field-node1-node11').value)
      .to.be.equal(overrideValue);
  });

  it('shows modification state', async function () {
    let treeValues;
    this.set('compareValues', undefined);
    this.set('valuesChanged', (values) => {
      if (!treeValues) {
        treeValues = values;
      }
    });
    await render(hbs `
      {{one-dynamic-tree
        definition=definition
        compareValues=compareValues
        valuesChanged=(action valuesChanged)
      }}
    `);
    const compareValue = 'compare';
    await fillIn('.field-node1-node11', 'test');
    expect(find('.modified-node-label')).to.not.exist;

    treeValues.node1.node11 = compareValue;
    this.set('compareValues', treeValues);
    await settled();
    expect(find('.modified-node-label')).to.exist;
  });
});
