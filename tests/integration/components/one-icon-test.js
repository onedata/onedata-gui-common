import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one icon', function () {
  setupComponentTest('one-icon', {
    integration: true
  });

  it('does not set color if color property is undefined', function () {
    this.render(hbs`{{one-icon icon="space"}}`);
    expect(this.$('.one-icon').attr('style') || '').to.not.contain('color');
  });

  it('set color if color property is "red"', function () {
    this.render(hbs`{{one-icon icon="space" color="red"}}`);
    expect(this.$('.one-icon').attr('style') || '').to.contain('color: red');
  });

  it('reacts to color property change after initial render', function () {
    this.set('color', undefined);

    this.render(hbs`{{one-icon icon="space" color=color}}`);
    
    this.set('color', 'red');
    expect(this.$('.one-icon').attr('style') || '').to.contain('color: red');
  });
});
