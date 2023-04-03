import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form-component/text-like-field', function () {
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

      expect(find('.text-like-field')).to.exist;
    }
  );

  it(
    'renders text input',
    async function () {
      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(find('input[type="text"]')).to.exist;
    }
  );

  it(
    'allows to render input with type different than "text"',
    async function () {
      this.set('textField.inputType', 'number');

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(find('input[type="number"]')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('textField.isEnabled', false);

      await render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(find('input[type="text"]').disabled).to.be.true;
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

    expect(find('input').value).to.equal('test');
  });

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/text-like-field field=textField fieldId="abc"}}
    `);

    expect(find('input#abc')).to.exist;
  });

  it('sets placeholder according to "placeholder"', async function () {
    this.set('textField.placeholder', 'test');

    await render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(find('input').placeholder).to.equal('test');
  });

  it('renders raw text when field is in "view" mode', async function () {
    const textField = this.get('textField');
    set(textField, 'value', 'test value');
    textField.changeMode('view');

    await render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.element.textContent.trim()).to.equal('test value');
    expect(find('input')).to.not.exist;
  });
});
