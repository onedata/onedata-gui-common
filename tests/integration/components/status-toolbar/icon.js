import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | status toolbar/icon', function () {
  setupComponentTest('status-toolbar/icon', {
    integration: true
  });

  it('is hidden if enabled is set to false', function () {
    this.render(hbs `{{status-icon type="space" enabled=false}}`);
    expect(this.$('.status-icon')).to.be.hidden;
  });

  it('adds a class based on status property', function () {
    this.render(hbs `{{status-icon icon="space" status="some"}}`);
    expect(this.$('.status-icon')).to.have.class('some');
  });
});
