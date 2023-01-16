import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { setProperties } from '@ember/object';

describe('Integration | Component | form component/static text field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', StaticTextField.create({ ownerSource: this.owner }));
  });

  it(
    'has class "static-text-field"',
    async function () {
      await render(hbs `{{form-component/static-text-field field=field}}`);

      expect(find('.static-text-field')).to.exist;
    }
  );

  it(
    'renders no content when both "text" and "value" field properties are empty',
    async function () {
      await render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.element.textContent.trim()).to.be.empty;
    }
  );

  it(
    'renders text from field.text property when field.value is empty',
    async function () {
      this.set('field.text', 'abc');

      await render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.element.textContent.trim()).to.equal('abc');
    }
  );

  it(
    'renders text from field.value property when field.value and field.text are not empty',
    async function () {
      setProperties(this.get('field'), {
        text: 'abc',
        value: 'def',
      });

      await render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.element.textContent.trim()).to.equal('def');
    }
  );
});
