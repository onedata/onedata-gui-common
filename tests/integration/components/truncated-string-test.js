import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | truncated-string', function () {
  setupRenderingTest();

  it('does not show tooltip, when text is fully visible', async function () {
    await render(hbs `
      <div style="min-width: 500px">
        {{#truncated-string}}short text{{/truncated-string}}
      </div>
    `);

    return triggerEvent('.truncated-string', 'mouseover')
      .then(() => expect(document.querySelector('.tooltip.in')).to.not.exist);
  });

  it('shows tooltip with full text, when text is not fully visible', async function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    await render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        {{#truncated-string}}{{longText}}{{/truncated-string}}
      </div>
    `);

    return triggerEvent('.truncated-string', 'mouseover')
      .then(() =>
        expect(document.querySelector('.tooltip.in').textContent.trim())
        .to.equal(longText)
      );
  });
});
