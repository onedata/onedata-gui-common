import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { set, setProperties } from '@ember/object';

describe('Integration | Component | form component/textarea field', function () {
  setupComponentTest('form-component/textarea-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', TextareaField.create({
      ownerSource: this,
    }));
  });

  it(
    'has class "textarea-field"',
    function () {
      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('.textarea-field')).to.exist;
    }
  );

  it(
    'renders textarea',
    function () {
      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.exist;
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      return focus('textarea')
        .then(() => blur('textarea'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      return fillIn('textarea', 'test')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('test');
        });
    }
  );

  it(
    'sets input value to string specified in field object',
    function () {
      this.set('field.value', 'test');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea').val()).to.equal('test');
    }
  );

  it('sets input id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/textarea-field field=field fieldId="abc"}}
    `);

    expect(this.$('textarea#abc')).to.exist;
  });

  it(
    'sets placeholder according to "placeholder"',
    function () {
      this.set('field.placeholder', 'test');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea').attr('placeholder')).to.equal('test');
    }
  );

  it(
    'renders readonly textarea when field is in "view" mode',
    function () {
      const field = this.get('field');
      set(field, 'value', 'test value');
      field.changeMode('view');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('readonly');
    }
  );

  it(
    'renders static text when field is in "view" mode and "viewModeAsStaticText" is true',
    function () {
      const field = this.get('field');
      setProperties(field, {
        value: 'test value',
        viewModeAsStaticText: true,
      });
      field.changeMode('view');

      this.render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.not.exist;
      expect(this.$().text().trim()).to.equal('test value');
    }
  );
});
