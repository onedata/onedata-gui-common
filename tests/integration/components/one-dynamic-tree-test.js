import {
  expect
} from 'chai';
import {
  describe,
  it,
  beforeEach
} from 'mocha';
import {
  setupComponentTest
} from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import {
  click,
  fillIn
} from 'ember-native-dom-helpers';
import sinon from 'sinon';
import Ember from 'ember';

const {
  A,
} = Ember;

const ERROR_MSG = 'error!';

describe('Integration | Component | one dynamic tree', function () {
  setupComponentTest('one-dynamic-tree', {
    integration: true
  });

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
                  label: '1'
                },
                {
                  value: '2',
                  label: '2'
                },
                {
                  value: '3',
                  label: '3'
                },
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
        allowSubtreeCheckboxSelect: true,
        subtree: [{
            name: 'node21',
            text: 'Node 2.1',
            field: {
              type: 'checkbox',
              defaultValue: false
            },
          },
          {
            name: 'node22',
            text: 'Node 2.2',
            field: {
              type: 'checkbox',
              defaultValue: true
            },
          }
        ],
      }
    ]);
    this.set('values', {
      node1: {
        node11: 'someDefault',
        node12: '1',
      },
      node2: {
        node21: false,
        node22: true,
      }
    });
    this.set('validations', Ember.Object.create({
      errors: [
        Ember.Object.create({
          attribute: 'values.node1.node11',
          message: ERROR_MSG
        })
      ]
    }));
  });

  it('renders fields', function () {
    this.render(hbs `{{one-dynamic-tree definition=definition}}`);
    expect(this.$('input[type="text"]')).to.exist;
    expect(this.$('.one-way-radio-group')).to.exist;
  });

  it('disables field', function () {
    this.set('disabledPaths', A(['node1.node11']));
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition 
        disabledFieldsPaths=disabledPaths}}`);
    expect(this.$('.field-node1-node11')).to.be.disabled;
    expect(this.$('.field-node1-node12 input[type="radio"]')).to.not.be.disabled;
  });

  it('disables nested field', function () {
    this.set('disabledPaths', A(['node1']));
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition 
        disabledFieldsPaths=disabledPaths}}`);
    expect(this.$('.field-node1-node11')).to.be.disabled;
    expect(this.$('.field-node1-node12 input[type="radio"]')).to.be.disabled;
  });

  it('validates data', function (done) {
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition
        validations=validations}}`);

    expect(this.$('.has-error')).to.not.exist;
    $('input[type="text"]').blur();
    wait().then(() => {
      expect(this.$('.has-error')).to.exist;
      expect(this.$('.has-error .form-message')).to.contain(ERROR_MSG);
      done();
    });
  });

  it('does not validate data in disabled fields', function (done) {
    this.set('disabledPaths', A());
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition
        validations=validations
        disabledFieldsPaths=disabledPaths}}`);

    $('input[type="text"]').blur();
    wait().then(() => {
      expect(this.$('.has-error')).to.exist;
      this.get('disabledPaths').pushObject('node1.node11');
      wait().then(() => {
        expect(this.$('.has-error')).to.not.exist;
        done();
      });
    });
  });

  it('allows data change', function (done) {
    let values = this.get('values');
    let newTextValue = 'text';
    let valuesChangedHandler = sinon.spy();

    this.on('valuesChanged', valuesChangedHandler);
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition
        valuesChanged=(action "valuesChanged")}}`);

    expect(valuesChangedHandler).to.be.calledOnce;
    expect(valuesChangedHandler.firstCall).calledWithExactly(values, true);
    fillIn('input[type="text"]', newTextValue).then(() => {
      let newValues = this.get('values');
      newValues.node1.node11 = newTextValue;
      expect(valuesChangedHandler).to.be.calledTwice;
      expect(valuesChangedHandler.secondCall).calledWithExactly(newValues, true);
      done();
    });
  });

  it('marks "select all" toggle as unchecked when not all nested toggles are checked',
    function () {
      this.render(hbs `
        {{one-dynamic-tree 
          definition=definition}}`);

      expect(this.$('.field-node2')).to.not.have.class('checked');
    }
  );

  it('allows to select all nested checkbox fields', function (done) {
    this.render(hbs `
      {{one-dynamic-tree 
        definition=definition}}`);

    click('.field-node2').then(() => {
      expect(this.$('.field-node2-node21')).to.have.class('checked');
      expect(this.$('.field-node2-node22')).to.have.class('checked');
      expect(this.$('.field-node2')).to.have.class('checked');
      done();
    });
  });

  it('ignores disabled toggle state in "select all" toggle state',
    function () {
      this.set('disabledPaths', A(['node2.node21']));
      this.render(hbs `
        {{one-dynamic-tree 
          definition=definition
          disabledFieldsPaths=disabledPaths}}`);

      expect(this.$('.field-node2')).to.have.class('checked');
    }
  );

  it('ignores disabled toggle on "select all" toggle change',
    function (done) {
      this.set('disabledPaths', A(['node2.node22']));
      this.render(hbs `
        {{one-dynamic-tree 
          definition=definition
          disabledFieldsPaths=disabledPaths}}`);

      let node21Field = this.$('.field-node2-node21');
      let node22Field = this.$('.field-node2-node22');
      click('.field-node2').then(() => {
        expect(node21Field).to.have.class('checked');
        expect(node22Field).to.have.class('checked');
        click('.field-node2').then(() => {
          expect(node21Field).to.not.have.class('checked');
          expect(node22Field).to.have.class('checked');
          done();
        });
      });
    }
  );
});
