import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const thousandSpaceHtml = '<span class="thousand-space"></span>';

describe('Integration | Helper | format number', function () {
  setupRenderingTest();

  checkNumberFormat({
    number: 123456.78,
    expectedString: `123${thousandSpaceHtml}457`,
    expectedStringDesc: '123 457',
  });

  checkNumberFormat({
    number: 123.45,
    expectedString: '123',
  });

  checkNumberFormat({
    number: null,
    expectedString: '0',
  });

  checkNumberFormat({
    number: 123456.78,
    format: '#\'##0.#',
    expectedString: '123\'456.8',
  });
});

function checkNumberFormat({
  format = undefined,
  number,
  expectedString,
  expectedStringDesc,
}) {
  it(
    `returns "${expectedStringDesc || expectedString}" for ${number} and ${format || 'default'} format`,
    async function () {
      this.setProperties({ number, format });

      await render(hbs `{{format-number number format=format}}`);

      expect(this.element.innerHTML.trim()).to.equal(expectedString);
    }
  );
}
