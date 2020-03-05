import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { triggerEvent } from 'ember-native-dom-helpers';
import $ from 'jquery';

describe('Integration | Component | truncated string', function () {
  setupComponentTest('truncated-string', {
    integration: true,
  });

  it('does not show tooltip, when text is fully visible', function () {
    this.render(hbs `
      <div style="min-width: 500px">
        {{#truncated-string}}short text{{/truncated-string}}
      </div>
    `);

    return triggerEvent('.truncated-string', 'mouseover')
      .then(() => expect($('.tooltip.in')).to.not.exist);
  });

  it('shows tooltip with full text, when text is not fully visible', function () {
    const longText =
      'Very very very very very very very very very very very very long text';
    this.set('longText', longText);

    this.render(hbs `
      <div style="min-width: 50px; max-width: 50px;">
        {{#truncated-string}}{{longText}}{{/truncated-string}}
      </div>
    `);

    return triggerEvent('.truncated-string', 'mouseover')
      .then(() => expect($('.tooltip.in').text().trim()).to.equal(longText));
  });
});
