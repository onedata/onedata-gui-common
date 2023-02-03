import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

      expect(find('.textarea-field')).to.exist;
    }
  );

  it(
    'renders textarea',
    async function () {
      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(find('textarea')).to.exist;
    }
  );

  it(
    'can be disabled',
    async function () {
      this.set('field.isEnabled', false);

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(find('textarea').disabled).to.be.true;
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

      expect(find('textarea').value).to.equal('test');
    }
  );

  it('sets input id according to "fieldId"', async function () {
    await render(hbs `
      {{form-component/textarea-field field=field fieldId="abc"}}
    `);

    expect(find('textarea#abc')).to.exist;
  });

  it(
    'sets placeholder according to "placeholder"',
    async function () {
      this.set('field.placeholder', 'test');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(find('textarea').placeholder).to.equal('test');
    }
  );

  it(
    'renders readonly textarea when field is in "view" mode',
    async function () {
      const field = this.get('field');
      set(field, 'value', 'test value');
      field.changeMode('view');

      await render(hbs `{{form-component/textarea-field field=field}}`);

      expect(find('textarea').readOnly).to.be.true;
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

      expect(find('textarea')).to.not.exist;
      expect(this.element.textContent.trim()).to.equal('test value');
    }
  );

  it('does not add "rows" and "cols" attributes when those have default value',
    async function () {
      await render(hbs `{{form-component/textarea-field field=field}}`);

      const textarea = find('textarea');
      expect(textarea.hasAttribute('rows')).to.false;
      expect(textarea.hasAttribute('cols')).to.false;
    }
  );

  it('adds "rows" and "cols" attributes when those have custom value',
    async function () {
      setProperties(this.get('field'), {
        rows: 3,
        cols: 9,
      });
      await render(hbs `{{form-component/textarea-field field=field}}`);

      const textarea = find('textarea');
      expect(textarea.getAttribute('rows')).to.equal('3');
      expect(textarea.getAttribute('cols')).to.equal('9');
    }
  );
});
