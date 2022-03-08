import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | one collapsible toolbar', function () {
  setupRenderingTest();

  // TODO: does not run under xvfb. To check.
  // it('renders in full version in large container', async function () {
  //   await render(hbs`
  //     <div class="bla" style="width: 1000px">
  //       {{#one-collapsible-toolbar as |toolbar|}}
  //         {{#toolbar.item}}
  //           Button
  //         {{/toolbar.item}}
  //       {{/one-collapsible-toolbar}}
  //     </div>
  //   `);
  //
  //   expect(this.$('.collapsible-toolbar-buttons'), 'buttons are visible')
  //     .to.be.visible;
  //   expect(this.$('.collapsible-toolbar-toggle'), 'toggle is hidden')
  //     .to.be.hidden;
  // });

  it('renders in minimized version in small container', async function () {
    await render(hbs `
      <div style="width: 10px">
        {{#one-collapsible-toolbar as |toolbar|}}
          {{#toolbar.item}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);

    expect(this.$('.collapsible-toolbar-buttons'), 'buttons are hidden')
      .to.be.hidden;
    expect(this.$('.collapsible-toolbar-toggle'), 'toggle is visible')
      .to.be.visible;
  });

  it('renders buttons properly', async function () {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    await render(hbs `
      {{#one-collapsible-toolbar as |toolbar|}}
        {{#toolbar.item buttonStyle="danger" triggerClasses="trigger-class"
          buttonSize="xs" itemAction=(action itemAction)}}
          Button
        {{/toolbar.item}}
      {{/one-collapsible-toolbar}}
    `);

    const button = this.$('button');
    expect(button, 'button has proper style class').to.have.class(
      'btn-danger');
    expect(button, 'button has trigger class').to.have.class('trigger-class');
    expect(button, 'button has proper size class').to.have.class('btn-xs');

    await click(button[0]);
    expect(actionOccurred, 'click action occurred').to.be.true;
  });

  it('renders dropdown properly', async function () {
    let actionOccurred = false;
    this.set('itemAction', () => {
      actionOccurred = true;
    });
    await render(hbs `
      <div style="width: 20px;">
        {{#one-collapsible-toolbar as |toolbar|}}
          {{#toolbar.item triggerClasses="trigger-class" itemAction=(action itemAction)}}
            Button
          {{/toolbar.item}}
        {{/one-collapsible-toolbar}}
      </div>
    `);

    await click('.collapsible-toolbar-toggle');
    const popover = $('body .webui-popover.in');
    expect(popover.length, 'shows popover after click').to.equal(1);
    const item = popover.find('a');
    expect(item, 'dropdown item has trigger class')
      .to.have.class('trigger-class');

    await click(item[0]);
    expect(actionOccurred, 'click action occurred').to.be.true;
    expect(popover, 'hides popover after item click').to.not.have
      .class('in');
  });
});
