import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | provider place/super circle', function () {
  setupComponentTest('provider-place/super-circle', {
    integration: true,
  });

  it('renders with source and without desitnation animation class', function () {
    this.render(hbs `{{provider-place/super-circle isSource=true}}`);

    const $superCircle = this.$('.super-circle');

    expect($superCircle).to.have.class('source');
    expect($superCircle).to.not.have.class('destination');
  });

  it('renders with destination and without source animation class', function () {
    this.render(hbs `{{provider-place/super-circle isDestination=true}}`);

    const $superCircle = this.$('.super-circle');

    expect($superCircle).to.not.have.class('source');
    expect($superCircle).to.have.class('destination');
  });

  it('renders with source and destination animation classes', function () {
    this.render(hbs `
      {{provider-place/super-circle isDestination=true isSource=true}}
    `);

    const $superCircle = this.$('.super-circle');

    expect($superCircle).to.have.class('source');
    expect($superCircle).to.have.class('destination');
  });
  
  it('renders without source and destination animation classes', function () {
    this.render(hbs `
      {{provider-place/super-circle isDestination=false isSource=false}}
    `);

    const $superCircle = this.$('.super-circle');

    expect($superCircle).to.not.have.class('source');
    expect($superCircle).to.not.have.class('destination');
  });
});
