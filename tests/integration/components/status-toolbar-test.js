import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Component | status-toolbar', function () {
  setupRenderingTest();

  it('hides icon if icon `enabled` property is set to false', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" enabled=false}}
      {{/status-toolbar}}
    `);
    expect(dom.isHidden(find('.status-toolbar-icon'))).to.be.true;
  });

  it('adds a class to icon based on status property', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" status="some"}}
      {{/status-toolbar}}
    `);
    expect(find('.status-toolbar-icon')).to.have.class('some');
  });

  it('adds a subicon to status icon', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" subIcon="checkbox-filled" subIconClass="subicon"}}
      {{/status-toolbar}}
    `);
    expect(find('.oneicon-checkbox-filled')).to.exist;
    expect(find('.oneicon-checkbox-filled')).to.have.class('subicon');
  });

  it('triggers status icon click action', async function () {
    let clickOccurred = false;
    this.set('iconClick', () => clickOccurred = true);
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" clickAction=(action iconClick)}}
      {{/status-toolbar}}
    `);
    click('.status-toolbar-icon').then(() => {
      expect(clickOccurred).to.be.true;
    });
  });
});
