import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form component/text like field', function () {
  setupComponentTest('form-component/text-like-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('textField', TextField.create({
      ownerSource: this,
    }));
  });

  it(
    'has class "text-like-field"',
    function () {
      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('.text-like-field')).to.exist;
    }
  );

  it(
    'renders text input',
    function () {
      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="text"]')).to.exist;
    }
  );

  it(
    'allows to render input with type different than "text"',
    function () {
      this.set('textField.inputType', 'number');

      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="number"]')).to.exist;
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('textField.isEnabled', false);

      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="text"]')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('textField'), 'focusLost');

      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      return focus('input')
        .then(() => blur('input'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('textField'), 'valueChanged');

      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      return fillIn('input', 'test')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('test');
        });
    }
  );

  it('sets input value to string specified in field object', function () {
    this.set('textField.value', 'test');

    this.render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$('input').val()).to.equal('test');
  });

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/text-like-field field=textField fieldId="abc"}}
    `);

    expect(this.$('input#abc')).to.exist;
  });

  it('sets placeholder according to "placeholder"', function () {
    this.set('textField.placeholder', 'test');

    this.render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$('input').attr('placeholder')).to.equal('test');
  });

  it('renders raw text when field is in "view" mode', function () {
    const textField = this.get('textField');
    set(textField, 'value', 'test value');
    textField.changeMode('view');

    this.render(hbs `{{form-component/text-like-field field=textField}}`);

    expect(this.$().text().trim()).to.equal('test value');
    expect(this.$('input')).to.not.exist;
  });
});
