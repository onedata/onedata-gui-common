import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { setProperties } from '@ember/object';

describe('Integration | Component | form component/static text field', function () {
  setupComponentTest('form-component/static-text-field', {
    integration: true
  });

  beforeEach(function () {
    this.set('field', StaticTextField.create({ ownerSource: this }));
  });

  it(
    'has class "static-text-field"',
    function () {
      this.render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.$('.static-text-field')).to.exist;
    }
  );

  it(
    'renders no content when both "text" and "value" field properties are empty',
    function () {
      this.render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.$().text().trim()).to.be.empty;
    }
  );

  it(
    'renders text from field.text property when field.value is empty',
    function () {
      this.set('field.text', 'abc');

      this.render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.$().text().trim()).to.equal('abc');
    }
  );

  it(
    'renders text from field.value property when field.value and field.text are not empty',
    function () {
      setProperties(this.get('field'), {
        text: 'abc',
        value: 'def',
      });

      this.render(hbs `{{form-component/static-text-field field=field}}`);

      expect(this.$().text().trim()).to.equal('def');
    }
  );
});
