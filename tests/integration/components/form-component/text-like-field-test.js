import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form component/text like field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('textField', TextField.create({
      ownerSource: this.owner,
    }));
  });

  it(
    'has class "text-like-field"',
    async function () {
      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('.text-like-field')).to.exist;
    }
  );

  it(
    'renders text input',
    async function () {
      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="text"]')).to.exist;
    }
  );

  it(
    'allows to render input with type different than "text"',
    async function () {
      this.set('textField.inputType', 'number');

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="number"]')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('textField.isEnabled', false);

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="text"]')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('textField'), 'focusLost');

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      return focus('input')
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('textField'), 'valueChanged');

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      return fillIn('input', 'test')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('test');
        });
    }
  );

  it('sets input value to string specified in field object', async function () {
    this.set('textField.value', 'test');

    await render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$('input').val()).to.equal('test');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/text-like-field field=textField fieldId="abc"}}
    `);

    expect(this.$('input#abc')).to.exist;
  });

  it('sets placeholder according to "placeholder"', async function () {
    this.set('textField.placeholder', 'test');

    await render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$('input').attr('placeholder')).to.equal('test');
  });

  it('renders raw text when field is in "view" mode', async function () {
    const textField = this.get('textField');
    set(textField, 'value', 'test value');
    textField.changeMode('view');

    await render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$().text().trim()).to.equal('test value');
    expect(this.$('input')).to.not.exist;
  });
});
