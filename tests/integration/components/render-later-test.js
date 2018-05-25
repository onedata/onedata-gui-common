import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | render later', function () {
  setupComponentTest('render-later', {
    integration: true
  });

  it('does not render content for falsy trigger value', function () {
    this.render(hbs `
      {{#render-later triggerRender=false}}
        <div class="test"></div>
      {{/render-later}}
    `);
    expect(this.$('.test')).to.not.exist;
  });

  it('renders content for truthy trigger value', function () {
    this.render(hbs `
      {{#render-later triggerRender=true}}
        <div class="test"></div>
      {{/render-later}}
    `);
    expect(this.$('.test')).to.exist;
  });

  it('renders content after trigger set to truthy value', function () {
    this.set('trigger', false);
    this.render(hbs `
      {{#render-later triggerRender=trigger}}
        <div class="test"></div>
      {{/render-later}}
    `);
    this.set('trigger', true);
    return wait().then(() => {
      expect(this.$('.test')).to.exist;
    });
  });

  it('does not change render state after trigger set to falsy value', function () {
    this.set('trigger', true);
    this.render(hbs `
      {{#render-later triggerRender=trigger}}
        <div class="test"></div>
      {{/render-later}}
    `);
    this.set('trigger', false);
    return wait().then(() => {
      expect(this.$('.test')).to.exist;
    });
  });
});
