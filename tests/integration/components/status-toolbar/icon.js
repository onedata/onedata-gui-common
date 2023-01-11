import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Component | status toolbar/icon', function () {
  setupRenderingTest();

  it('is hidden if enabled is set to false', async function () {
    await render(hbs `{{status-icon type="space" enabled=false}}`);
    expect(dom.isHidden(find('.status-icon'))).to.be.true;
  });

  it('adds a class based on status property', async function () {
    await render(hbs `{{status-icon icon="space" status="some"}}`);
    expect(find('.status-icon')).to.have.class('some');
  });
});
