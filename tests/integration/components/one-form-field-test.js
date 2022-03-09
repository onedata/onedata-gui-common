import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | one form field', function () {
  setupRenderingTest();

  it('can render text input with provided value', async function () {
    this.set('field', {
      name: 'one',
      type: 'text',
    });
    this.set('value', 'hello');
    await render(hbs `
      {{one-form-field field=field value=value}}
    `);
    expect(this.$('input[type=text]')).to.have.length(1);
    expect(this.$('input').val()).to.be.equal('hello');
  });

  it('renders an input with a class with field name', async function () {
    this.set('field', {
      name: 'one',
      type: 'text',
    });
    await render(hbs `
      {{one-form-field field=field}}
    `);
    let $field = this.$('input');
    expect($field).to.have.class('field-one');
  });

  it('invokes inputChanged when value is changed', async function () {
    this.set('field', {
      name: 'one',
      type: 'text',
    });
    const inputChanged = sinon.stub();
    this.set('inputChanged', inputChanged);
    await render(hbs `
      {{one-form-field
        inputId="test-field"
        field=field
        inputChanged=(action inputChanged)
      }}
    `);
    return fillIn('#test-field', 'hello').then(() => {
      expect(inputChanged).to.have.been.calledWith('one', 'hello');
    });
  });
});
