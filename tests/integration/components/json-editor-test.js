import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | json editor', function () {
  setupRenderingTest();

  it('shows passed value', async function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    await render(hbs `{{json-editor value=value}}`);

    expect(JSON.parse(find('textarea').value)).to.deep.equal(value);
  });

  it('notifies about correct data', async function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    const spy = sinon.spy((res) => {
      expect(JSON.parse(res.value)).to.deep.equal(value);
      expect(res.parsedValue).to.deep.equal(value);
      expect(res.isValid).to.be.true;
    });
    this.set('onChange', spy);
    await render(hbs `{{json-editor onChange=(action onChange)}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value)).then(() => {
      expect(spy).to.be.calledOnce;
    });
  });

  it('notifies about incorrect data', async function () {
    const value = { a: 'a' };
    this.set('value', JSON.stringify(value));
    const spy = sinon.spy((res) => {
      expect(res.value).to.contain('x');
      expect(res.parsedValue).to.be.undefined;
      expect(res.isValid).to.be.false;
    });
    this.set('onChange', spy);
    await render(hbs `{{json-editor onChange=(action onChange)}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(spy).to.be.calledOnce;
    });
  });

  it('shows information about invalid data', async function () {
    const value = { a: 'a' };
    this.set('value', '{}');
    this.set('onChange', (res) => {
      this.set('value', res.value);
    });
    await render(hbs `{{json-editor value=value onChange=(action onChange)}}`);

    return fillIn('.json-editor-textarea', JSON.stringify(value) + 'x').then(() => {
      expect(find('.form-message')).to.exist;
      expect(find('.json-editor.has-error')).to.exist;
    });
  });
});
