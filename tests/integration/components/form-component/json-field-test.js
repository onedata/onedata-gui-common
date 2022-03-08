import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { focus, blur, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | form component/json field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', JsonField.create({
      ownerSource: this.owner,
    }));
  });

  it(
    'has class "json-field"',
    async function () {
      await render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('.json-field')).to.exist;
    }
  );

  it(
    'renders textarea',
    async function () {
      await render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('textarea')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/json-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/json-field field=field}}`);

      return focus('textarea')
        .then(() => blur('textarea'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/json-field field=field}}`);

      return fillIn('textarea', '"test"')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('"test"');
        });
    }
  );

  it('sets textarea value to string specified in field object', async function () {
    this.set('field.value', '"test"');

    await render(hbs `{{form-component/json-field field=field}}`);

    expect(this.$('textarea').val()).to.equal('"test"');
  });

  it('sets textarea id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/json-field field=field fieldId="abc"}}
    `);

    expect(this.$('textarea#abc')).to.exist;
  });

  it('renders readonly value when field is in "view" mode', async function () {
    const field = this.get('field');
    set(field, 'value', '"test"');
    field.changeMode('view');

    await render(hbs `{{form-component/json-field field=field}}`);

    expect(this.$('textarea').val()).to.equal('"test"');
    expect(this.$('textarea')).to.have.attr('readonly');
  });

  it('sets placeholder according to "placeholder"', async function () {
    this.set('field.placeholder', 'test');

    await render(hbs `{{form-component/json-field field=field}}`);

    expect(this.$('textarea').attr('placeholder')).to.equal('test');
  });
});
