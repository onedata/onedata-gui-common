import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Helper | model routable id', function () {
  setupRenderingTest();

  it('extracts id', async function () {
    this.set('inputValue', EmberObject.create({ id: '1' }));
    await render(hbs `{{model-routable-id inputValue}}`);
    expect(this.element.textContent.trim()).to.equal('1');
  });
});
