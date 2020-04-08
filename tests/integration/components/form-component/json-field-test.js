import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form component/json field', function () {
  setupComponentTest('form-component/json-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', JsonField.create());
  });

  it(
    'has class "json-field"',
    function () {
      this.render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('.json-field')).to.exist;
    }
  );

  it(
    'renders textarea',
    function () {
      this.render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('textarea')).to.exist;
    }
  );

  it(
    'can be disabled',
    function () {
      this.set('field.isEnabled', false);

      this.render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      this.render(hbs `{{form-component/json-field field=field}}`);

      return focus('textarea')
        .then(() => blur('textarea'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      this.render(hbs `{{form-component/json-field field=field}}`);

      return fillIn('textarea', '"test"')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('"test"');
        });
    }
  );

  it('sets textarea value to string specified in field object', function () {
    this.set('field.value', '"test"');

    this.render(hbs `{{form-component/json-field field=field}}`);

    expect(this.$('textarea').val()).to.equal('"test"');
  });

  it('sets textarea id according to "fieldId"', function () {
    this.render(hbs `
      {{form-component/json-field field=field fieldId="abc"}}
    `);

    expect(this.$('textarea#abc')).to.exist;
  });

  it('renders readonly value when field is in "view" mode', function () {
    const field = this.get('field');
    set(field, 'value', '"test"');
    field.changeMode('view');

    this.render(hbs `{{form-component/json-field field=field}}`);

    expect(this.$('textarea').val()).to.equal('"test"');
    expect(this.$('textarea')).to.have.attr('readonly');
  });
});
