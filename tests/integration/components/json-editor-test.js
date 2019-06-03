import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | json editor', function () {
  setupComponentTest('json-editor', {
    integration: true
  });

  it('shows passed value', function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    this.render(hbs `{{json-editor value=value}}`);

    expect(JSON.parse(this.$('textarea').val())).to.deep.equal(value);
  });

  it('notifies about correct data', function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    const spy = sinon.spy((res) => {
      expect(JSON.parse(res.value)).to.deep.equal(value);
      expect(res.parsedValue).to.deep.equal(value);
      expect(res.isValid).to.be.true;
    });
    this.on('onChange', spy);
    this.render(hbs `{{json-editor onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value)).then(() => {
      expect(spy).to.be.calledOnce;
    })
  });

  it('notifies about incorrect data', function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    const spy = sinon.spy((res) => {
      expect(res.value).to.contain('x');
      expect(res.parsedValue).to.be.undefined;
      expect(res.isValid).to.be.false;
    });
    this.on('onChange', spy);
    this.render(hbs `{{json-editor onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(spy).to.be.calledOnce;
    })
  });

  it('shows information about invalid data', function () {
    const value = { a: 'a' };
    this.set('value', '{}');
    this.on('onChange', (res) => {
      this.set('value', res.value);
    });
    this.render(hbs `{{json-editor value=value onChange=(action "onChange")}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(this.$('.form-message')).to.exist;
      expect(this.$('.json-editor.has-error')).to.exist;
    })
  });
});
