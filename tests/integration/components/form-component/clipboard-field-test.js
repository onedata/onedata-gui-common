import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { setProperties } from '@ember/object';
import { find } from 'ember-native-dom-helpers';

describe('Integration | Component | form component/clipboard field', function () {
  setupComponentTest('form-component/clipboard-field', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', ClipboardField.create({ ownerSource: this }));
  });

  it(
    'has class "clipboard-field"',
    function () {
      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('.clipboard-field')).to.exist;
    }
  );

  it(
    'renders no content when both "text" and "value" field properties are empty',
    function () {
      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('input').val()).to.be.empty;
    }
  );

  it(
    'renders text from field.text property when field.value is empty',
    function () {
      this.set('field.text', 'abc');

      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('input').val()).to.equal('abc');
    }
  );

  it(
    'renders text from field.value property when field.value and field.text are not empty',
    function () {
      setProperties(this.get('field'), {
        text: 'abc',
        value: 'def',
      });

      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('input').val()).to.equal('def');
    }
  );

  it(
    'allows to render text using textarea',
    function () {
      setProperties(this.get('field'), {
        text: 'abc',
        type: 'textarea',
      });

      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('textarea').val()).to.equal('abc');
    }
  );

  it(
    'allows to specify textarea height in rows',
    function () {
      setProperties(this.get('field'), {
        type: 'textarea',
        textareaRows: 7,
      });

      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(this.$('textarea').prop('rows')).to.equal(7);
    }
  );

  it(
    'adds "monospace-font" class to clipboard-line in "monospace" fieldStyle',
    function () {
      this.set('field.fieldStyle', 'monospace');

      this.render(hbs `{{form-component/clipboard-field field=field}}`);

      expect([...find('.clipboard-field .clipboard-line').classList])
        .to.contain('monospace-font');
    }
  );
});
