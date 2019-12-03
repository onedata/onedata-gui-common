import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | form component/text like field', function () {
  setupComponentTest('form-component/text-like-field', {
    integration: true
  });

  beforeEach(function () {
    this.set('textField', TextField.create());
  });

  it(
    'renders text input',
    function () {
      this.render(hbs `{{form-component/text-like-field field=textField}}`);

      expect(this.$('input[type="text"]')).to.exist;
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
});
