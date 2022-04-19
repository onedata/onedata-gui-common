import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | loading container', function () {
  setupRenderingTest();

  it('renders yielded content if isLoading is false', async function () {
    await render(hbs `{{#loading-container isLoading=false}}
      <div class="some-content">Some content</div>
    {{/loading-container}}
    `);
    expect(find('.some-content')).to.exist;
  });

  it('does not render yielded content if isLoading is true', async function () {
    await render(hbs `{{#loading-container isLoading=true}}
      <div class="some-content">Some content</div>
    {{/loading-container}}
    `);
    expect(find('.some-content')).to.not.exist;
  });

  it('render erroReason if available', async function () {
    await render(hbs `{{#loading-container errorReason="some reason"}}
      <div class="some-content">Some content</div>
    {{/loading-container}}
    `);
    expect(find('.some-content')).to.not.exist;
    expect(find('.resource-load-error').textContent).to.contain('some reason');
  });
});
