import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | provider place/super circle', function () {
  setupRenderingTest();

  it('renders with source and without desitnation animation class', async function () {
    await render(hbs `{{provider-place/super-circle isSource=true}}`);

    const superCircle = find('.super-circle');

    expect(superCircle).to.have.class('source');
    expect(superCircle).to.not.have.class('destination');
  });

  it('renders with destination and without source animation class', async function () {
    await render(hbs `{{provider-place/super-circle isDestination=true}}`);

    const superCircle = find('.super-circle');

    expect(superCircle).to.not.have.class('source');
    expect(superCircle).to.have.class('destination');
  });

  it('renders with source and destination animation classes', async function () {
    await render(hbs `
      {{provider-place/super-circle isDestination=true isSource=true}}
    `);

    const superCircle = find('.super-circle');

    expect(superCircle).to.have.class('source');
    expect(superCircle).to.have.class('destination');
  });

  it('renders without source and destination animation classes', async function () {
    await render(hbs `
      {{provider-place/super-circle isDestination=false isSource=false}}
    `);

    const superCircle = find('.super-circle');

    expect(superCircle).to.not.have.class('source');
    expect(superCircle).to.not.have.class('destination');
  });
});
