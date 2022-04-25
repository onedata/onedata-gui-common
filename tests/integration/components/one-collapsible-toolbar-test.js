import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | one collapsible toolbar', function () {
  setupRenderingTest();

  it('renders in full version in large container', async function () {
    await render(hbs `
      <div class="bla" style="width: 1000px">
        {{#one-collapsible-toolbar minimumFullWindowSize=0 as |toolbar|}}
          {{#toolbar.item}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);

    expect($(find('.collapsible-toolbar-buttons')).is(':visible'), 'buttons are visible')
      .to.be.true;
    expect($(find('.collapsible-toolbar-toggle')).is(':hidden'), 'toggle is hidden')
      .to.be.true;
  });

  it('renders in minimized version in small container', async function () {
    await render(hbs `
      <div style="width: 10px">
        {{#one-collapsible-toolbar minimumFullWindowSize=0 as |toolbar|}}
          {{#toolbar.item}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);

    expect($(find('.collapsible-toolbar-buttons')).is(':hidden'), 'buttons are hidden')
      .to.be.true;
    expect($(find('.collapsible-toolbar-toggle')).is(':visible'), 'toggle is visible')
      .to.be.true;
  });

  it('renders buttons properly', async function () {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    await render(hbs `
      {{#one-collapsible-toolbar minimumFullWindowSize=0 as |toolbar|}}
        {{#toolbar.item buttonStyle="danger" triggerClasses="trigger-class"
          buttonSize="xs" itemAction=(action itemAction)}}
          Button
        {{/toolbar.item}}
      {{/one-collapsible-toolbar}}
    `);

    const button = find('button');
    expect(button, 'button has proper style class').to.have.class(
      'btn-danger');
    expect(button, 'button has trigger class').to.have.class('trigger-class');
    expect(button, 'button has proper size class').to.have.class('btn-xs');

    await click(button);
    expect(actionOccurred, 'click action occurred').to.be.true;
  });

  it('renders dropdown properly', async function () {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    await render(hbs `
      <div style="width: 20px;">
        {{#one-collapsible-toolbar minimumFullWindowSize=0 as |toolbar|}}
          {{#toolbar.item triggerClasses="trigger-class" itemAction=(action itemAction)}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);

    await click('.collapsible-toolbar-toggle');
    const popovers = document.querySelectorAll('.webui-popover.in');
    expect(popovers.length, 'shows popover after click').to.equal(1);
    const item = popovers[0].querySelector('a');
    expect(item, 'dropdown item has trigger class')
      .to.have.class('trigger-class');

    await click(item);
    expect(actionOccurred, 'click action occurred').to.be.true;
    expect(popovers[0], 'hides popover after item click').to.not.have
      .class('in');
  });
});
