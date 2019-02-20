import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | json editor', function() {
  setupComponentTest('json-editor', {
    integration: true
  });

  it('shows passed value', function () {
    const value = {a: 'a'};
    this.set('value', JSON.stringify(value));
    this.render(hbs`{{json-editor value=value}}`);

    expect(JSON.parse(this.$('textarea').val())).to.deep.equal(value);
  });

  it('notifies about correct data', function () {
    const value = {a: 'a'};
    this.set('value', JSON.stringify(value));
    let actionFired = false;
    this.on('onChange', (res) => {
      actionFired = true;
      expect(JSON.parse(res.value)).to.deep.equal(value);
      expect(res.parsedValue).to.deep.equal(value);
      expect(res.isValid).to.be.true;
    });
    this.render(hbs`{{json-editor onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value)).then(() => {
      expect(actionFired).to.be.true;
    })
  });

  it('notifies about incorrect data', function () {
    const value = {a: 'a'};
    this.set('value', JSON.stringify(value));
    let actionFired = false;
    this.on('onChange', (res) => {
      actionFired = true;
      expect(res.value).to.contain('x');
      expect(res.parsedValue).to.be.undefined;
      expect(res.isValid).to.be.false;
    });
    this.render(hbs`{{json-editor onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(actionFired).to.be.true;
    })
  });

  it('shows information about invalid data', function () {
    const value = {a: 'a'};
    this.set('value', '{}');
    this.on('onChange', (res) => {
      this.set('value', res.value);
    });
    this.render(hbs`{{json-editor value=value onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(this.$('.form-message')).to.exist;
      expect(this.$('.json-editor.has-error')).to.exist;
    })
  });
});
