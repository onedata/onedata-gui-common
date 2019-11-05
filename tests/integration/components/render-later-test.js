import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';

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

  it('resets render state through property "resetRender"', function () {
    this.setProperties({
      trigger: 'whatever',
      resetTrigger: 'whatever2',
    });
    this.render(hbs `
      {{#render-later triggerRender=trigger resetRender=resetTrigger}}
        <div class="test"></div>
      {{/render-later}}
    `);

    return wait().then(() => {
      this.setProperties({
        trigger: false,
        resetTrigger: 'whatever3',
      });
      return wait().then(() => {
        expect(this.$('.test')).to.not.exist;
      });
    });
  });

  it('resets render state through yielded action "resetRenderTrigger"', function () {
    this.set('trigger', true);
    this.render(hbs `
      {{#render-later triggerRender=trigger as |renderLater|}}
        <div class="test" {{action renderLater.resetRenderTrigger}}></div>
      {{/render-later}}
    `);

    this.set('trigger', false);
    return click('.test').then(() => {
      expect(this.$('.test')).to.not.exist;
    });
  });
});
