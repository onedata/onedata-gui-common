import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import sinon from 'sinon';
import { set, setProperties } from '@ember/object';

describe('Integration | Component | form component/textarea field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', TextareaField.create({
      ownerSource: this.owner,
    }));
  });

  it(
    'has class "textarea-field"',
    async function () {
      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('.textarea-field')).to.exist;
    }
  );

  it(
    'renders textarea',
    async function () {
      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('disabled');
    }
  );

  it(
    'notifies field object about lost focus',
    async function () {
      const focusLostSpy = sinon.spy(this.get('field'), 'focusLost');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      return focus('textarea')
        .then(() => blur('textarea'))
        .then(() => expect(focusLostSpy).to.be.calledOnce);
    }
  );

  it(
    'notifies field object about changed value',
    async function () {
      const valueChangedSpy = sinon.spy(this.get('field'), 'valueChanged');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      return fillIn('textarea', 'test')
        .then(() => {
          expect(valueChangedSpy).to.be.calledOnce;
          expect(valueChangedSpy).to.be.calledWith('test');
        });
    }
  );

  it(
    'sets input value to string specified in field object',
    async function () {
      this.set('field.value', 'test');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea').val()).to.equal('test');
    }
  );

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/textarea-field field=field fieldId="abc"}}
    `);

    expect(this.$('textarea#abc')).to.exist;
  });

  it(
    'sets placeholder according to "placeholder"',
    async function () {
      this.set('field.placeholder', 'test');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea').attr('placeholder')).to.equal('test');
    }
  );

  it(
    'renders readonly textarea when field is in "view" mode',
    async function () {
      const field = this.get('field');
      set(field, 'value', 'test value');
      field.changeMode('view');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.have.attr('readonly');
    }
  );

  it(
    'renders static text when field is in "view" mode and "showsStaticTextInViewMode" is true',
    async function () {
      const field = this.get('field');
      setProperties(field, {
        value: 'test value',
        showsStaticTextInViewMode: true,
      });
      field.changeMode('view');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(this.$('textarea')).to.not.exist;
      expect(this.$().text().trim()).to.equal('test value');
    }
  );
});
