import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | status toolbar/icon', function () {
  setupRenderingTest();

  it('is hidden if enabled is set to false', async function () {
    await render(hbs `{{status-icon type="space" enabled=false}}`);
    expect($(find('.status-icon'))).to.be.hidden;
  });

  it('adds a class based on status property', async function () {
    await render(hbs `{{status-icon icon="space" status="some"}}`);
    expect($(find('.status-icon'))).to.have.class('some');
  });
});
