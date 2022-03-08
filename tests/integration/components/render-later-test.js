import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | render later', function () {
  setupRenderingTest();

  it('does not render content for falsy trigger value', async function () {
    await render(hbs `
      {{#render-later triggerRender=false}}
        <div class="test"></div>
      {{/render-later}}
    `);
    expect(this.$('.test')).to.not.exist;
  });

  it('renders content for truthy trigger value', async function () {
    await render(hbs `
      {{#render-later triggerRender=true}}
        <div class="test"></div>
      {{/render-later}}
    `);
    expect(this.$('.test')).to.exist;
  });

  it('renders content after trigger set to truthy value', async function () {
    this.set('trigger', false);
    await render(hbs `
      {{#render-later triggerRender=trigger}}
        <div class="test"></div>
      {{/render-later}}
    `);

    this.set('trigger', true);
    await settled();

    expect(this.$('.test')).to.exist;
  });

  it('does not change render state after trigger set to falsy value', async function () {
    this.set('trigger', true);
    await render(hbs `
      {{#render-later triggerRender=trigger}}
        <div class="test"></div>
      {{/render-later}}
    `);

    this.set('trigger', false);
    await settled();

    expect(this.$('.test')).to.exist;
  });

  it('resets render state through property "resetRender"', async function () {
    this.setProperties({
      trigger: 'whatever',
      resetTrigger: 'whatever2',
    });
    await render(hbs `
      {{#render-later triggerRender=trigger resetRender=resetTrigger}}
        <div class="test"></div>
      {{/render-later}}
    `);

    this.setProperties({
      trigger: false,
      resetTrigger: 'whatever3',
    });
    await settled();

    expect(this.$('.test')).to.not.exist;

  });

  it('resets render state through yielded action "resetRenderTrigger"', async function () {
    this.set('trigger', true);
    await render(hbs `
      {{#render-later triggerRender=trigger as |renderLater|}}
        <div class="test" {{action renderLater.resetRenderTrigger}}></div>
      {{/render-later}}
    `);

    this.set('trigger', false);
    await click('.test');

    expect(this.$('.test')).to.not.exist;
  });
});
