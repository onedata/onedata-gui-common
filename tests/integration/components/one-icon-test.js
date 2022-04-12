import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | one icon', function () {
  setupRenderingTest();

  it('does not set color if color property is undefined', async function () {
    await render(hbs `{{one-icon icon="space"}}`);
    expect($(find('.one-icon')).attr('style') || '').to.not.contain('color');
  });

  it('set color if color property is "red"', async function () {
    await render(hbs `{{one-icon icon="space" color="red"}}`);
    expect($(find('.one-icon')).attr('style') || '').to.contain('color: red');
  });

  it('reacts to color property change after initial render', async function () {
    this.set('color', undefined);

    await render(hbs `{{one-icon icon="space" color=color}}`);

    this.set('color', 'red');
    expect($(find('.one-icon')).attr('style') || '').to.contain('color: red');
  });
});
