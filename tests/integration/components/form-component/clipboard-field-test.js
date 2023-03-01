import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { setProperties } from '@ember/object';

describe('Integration | Component | form-component/clipboard-field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', ClipboardField.create({ ownerSource: this.owner }));
  });

  it(
    'has class "clipboard-field"',
    async function () {
      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('.clipboard-field')).to.exist;
    }
  );

  it(
    'renders no content when both "text" and "value" field properties are empty',
    async function () {
      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('input').value).to.be.empty;
    }
  );

  it(
    'renders text from field.text property when field.value is empty',
    async function () {
      this.set('field.text', 'abc');

      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('input').value).to.equal('abc');
    }
  );

  it(
    'renders text from field.value property when field.value and field.text are not empty',
    async function () {
      setProperties(this.get('field'), {
        text: 'abc',
        value: 'def',
      });

      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('input').value).to.equal('def');
    }
  );

  it(
    'allows to render text using textarea',
    async function () {
      setProperties(this.get('field'), {
        text: 'abc',
        type: 'textarea',
      });

      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('textarea').value).to.equal('abc');
    }
  );

  it(
    'allows to specify textarea height in rows',
    async function () {
      setProperties(this.get('field'), {
        type: 'textarea',
        textareaRows: 7,
      });

      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('textarea').rows).to.equal(7);
    }
  );

  it(
    'adds "monospace-font" class to clipboard-line in "monospace" fieldStyle',
    async function () {
      this.set('field.fieldStyle', 'monospace');

      await render(hbs `{{form-component/clipboard-field field=field}}`);

      expect(find('.clipboard-field .clipboard-line'))
        .to.have.class('monospace-font');
    }
  );
});
