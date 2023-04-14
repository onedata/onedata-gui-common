import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import globals from 'onedata-gui-common/utils/globals';

const CONTENT_TEXT = 'contentText';
const WINDOW_WIDTH_LG = 1000;
const WINDOW_WIDTH_SM = 400;

describe('Integration | Component | one-switchable-popover-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('contentText', CONTENT_TEXT);
    globals.mock('window', {
      resizeListeners: new Set(),
      innerWidth: WINDOW_WIDTH_LG,
      addEventListener(event, listener) {
        if (event === 'resize') {
          this.resizeListeners.add(listener);
        } else {
          globals.nativeWindow.addEventListener(...arguments);
        }
      },
      removeEventListener(event, listener) {
        if (event === 'resize') {
          this.resizeListeners.delete(listener);
        } else {
          globals.nativeWindow.removeEventListener(...arguments);
        }
      },
      triggerResize() {
        this.resizeListeners.forEach((listener) => listener());
      },
    });
  });

  it('renders content', async function () {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        triggersConfiguration=".trigger"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    expect(globals.document.querySelector('body').textContent)
      .to.not.contain(CONTENT_TEXT);

    await click('.trigger');
    expect(globals.document.querySelector('body').textContent).to.contain(CONTENT_TEXT);
  });

  it('reacts to window resize', async function () {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        modalClass="modal-element"
        triggersConfiguration=".trigger"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    expect(globals.document.querySelector('.popover-element')).to.exist;
    expect(globals.document.querySelector('.modal-element')).to.not.exist;

    globals.window.innerWidth = WINDOW_WIDTH_SM;
    globals.window.triggerResize();
    await settled();
    expect(globals.document.querySelector('.popover-element')).to.not.exist;
    expect(globals.document.querySelector('.modal-element')).to.exist;

    globals.window.innerWidth = WINDOW_WIDTH_LG;
    globals.window.triggerResize();
    await settled();
    expect(globals.document.querySelector('.popover-element')).to.exist;
    expect(globals.document.querySelector('.modal-element')).to.not.exist;
  });

  it('emits events onShow, onShown', async function () {
    let showOccurred = false;
    let shownOccurred = false;
    this.set('onShow', () => {
      showOccurred = true;
    });
    this.set('onShown', () => {
      shownOccurred = true;
    });
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        triggersConfiguration=".trigger"
        onShow=(action onShow)
        onShown=(action onShown)}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');

    expect(showOccurred).to.be.true;
    expect(shownOccurred).to.be.true;
  });

  it('emits events onHide, onHidden', async function () {
    let hideOccurred = false;
    let hiddenOccurred = false;
    this.set('onHide', () => {
      hideOccurred = true;
    });
    this.set('onHidden', () => {
      hiddenOccurred = true;
    });
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        triggersConfiguration=".trigger"
        onHide=(action onHide)
        onHidden=(action onHidden)}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    await click('.trigger');

    expect(hideOccurred).to.be.true;
    expect(hiddenOccurred).to.be.true;
  });

  it('shows and hides popover on trigger click', async function () {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        triggersConfiguration=".trigger:popover"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    expect(globals.document.querySelector('.in .popover-element')).to.exist;

    await click('.trigger');
    expect(globals.document.querySelector('.out .popover-element')).to.exist;

  });

  it('hides popover on outside click', async function () {
    await render(hbs `
      <div class="container">
        <button class="trigger">Trigger</button>
        {{#one-switchable-popover-modal
          modalTransitionDuration=0
          popoverClass="popover-element"
          triggersConfiguration=".trigger:popover"}}
          {{contentText}}
        {{/one-switchable-popover-modal}}
      </div>
    `);

    await click('.trigger');
    await click('.container');

    expect(globals.document.querySelector('.out .popover-element')).to.exist;
  });

  it('does not hide popover on content click', async function () {
    await render(hbs `
      <div class="container">
        <button class="trigger">Trigger</button>
        {{#one-switchable-popover-modal
          modalTransitionDuration=0
          popoverClass="popover-element"
          triggersConfiguration=".trigger:popover"}}
          <button class="content-button">Click me</button>
        {{/one-switchable-popover-modal}}
      </div>
    `);

    await click('.trigger');
    await click('.content-button');

    expect(globals.document.querySelector('.in .popover-element')).to.exist;
  });

  it('shows and hides modal', async function () {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        modalClass="modal-element"
        triggersConfiguration=".trigger:modal"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    expect(globals.document.querySelector('.modal-element.in')).to.exist;

    // click on backdrop
    await click(globals.document.querySelector('.modal'));
    expect(globals.document.querySelector('.modal-element.in')).to.not.exist;
  });

  it('does not hide modal on content click', async function () {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        modalClass="modal-element"
        triggersConfiguration=".trigger:modal"}}
        <button class="content-button">Click me</button>
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    await click('.content-button');

    expect(globals.document.querySelector('.modal-element.in')).to.exist;
  });

  it('handles with different triggers', async function () {
    await render(hbs `
      <button class="trigger-popover">Trigger1</button>
      <button class="trigger-modal">Trigger2</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        modalClass="modal-element"
        triggersConfiguration=".trigger-modal:modal;.trigger-popover:popover"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger-popover');
    expect(globals.document.querySelector('.in .popover-element')).to.exist;

    await click('.trigger-modal');
    expect(globals.document.querySelector('.modal-element.in')).to.exist;
    expect(globals.document.querySelector('.popover-element')).to.not.exist;
  });

  it('sets appropriate classes', async function () {
    await render(hbs `
      <button class="trigger-popover">Trigger1</button>
      <button class="trigger-modal">Trigger2</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        modalClass="modal-element"
        componentClass="component-element"
        triggersConfiguration=".trigger-modal:modal;.trigger-popover:popover"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger-popover');
    expect(globals.document.querySelector('.popover-element.component-element')).to.exist;

    await click('.trigger-modal');
    expect(globals.document.querySelector('.modal-element.component-element')).to.exist;
  });

  it('can be controlled by open property', async function () {
    this.set('open', false);
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        triggersConfiguration=".trigger:popover"
        open=open
        activeTriggerSelector=".trigger"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    expect(globals.document.querySelector('.in .popover-element')).to.not.exist;

    this.set('open', true);
    await settled();
    expect(globals.document.querySelector('.in .popover-element')).to.exist;

    this.set('open', false);
    await settled();
    expect(globals.document.querySelector('.in .popover-element')).to.not.exist;
  });

  it('does not hide if onHide returns false', async function () {
    this.set('onHide', () => {
      return false;
    });
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        triggersConfiguration=".trigger:popover"
        onHide=(action onHide)}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    await click('.trigger');
    expect(globals.document.querySelector('.in .popover-element')).to.exist;
  });

  it('does not show if onShow returns false', async function () {
    this.set('onShow', () => false);
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        triggersConfiguration=".trigger:popover"
        onShow=(action onShow)}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    expect(globals.document.querySelector('.in .popover-element')).to.not.exist;
  });

  it('can reattach content to another trigger while using open property',
    async function () {
      this.setProperties({
        activeTriggerSelector: '.trigger-modal',
        open: true,
      });
      await render(hbs `
        <button class="trigger-popover">Trigger1</button>
        <button class="trigger-modal">Trigger2</button>
        {{#one-switchable-popover-modal
          modalTransitionDuration=0
          popoverClass="popover-element"
          modalClass="modal-element"
          triggersConfiguration=".trigger-modal:modal;.trigger-popover:popover"
          open=open
          activeTriggerSelector=activeTriggerSelector}}
          {{contentText}}
        {{/one-switchable-popover-modal}}
      `);

      expect(globals.document.querySelector('.modal-element.in')).to.exist;

      this.set('activeTriggerSelector', '.trigger-popover');
      await settled();
      expect(globals.document.querySelector('body')).to.not.have.class('modal-open');
      expect(globals.document.querySelector('.in .popover-element')).to.exist;
    }
  );

  it('can react to triggersConfiguration change', async function () {
    this.set('triggersConfiguration', '.trigger-modal:modal');
    await render(hbs `
      <button class="trigger-popover">Trigger1</button>
      <button class="trigger-modal">Trigger2</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        modalClass="modal-element"
        triggersConfiguration=triggersConfiguration}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger-modal');
    expect(globals.document.querySelector('.modal-element.in')).to.exist;

    this.set('triggersConfiguration', '.trigger-popover:popover');
    await settled();
    expect(globals.document.querySelector('.modal-element.in')).to.not.exist;

    await click('.trigger-popover');
    expect(globals.document.querySelector('.in .popover-element')).to.exist;
  });

  it('passes trigger selector via onShow argument', async function () {
    let onShowTriggerSelector = false;
    this.set('onShow', (selector) => {
      onShowTriggerSelector = selector;
    });
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        triggersConfiguration=".trigger"
        onShow=(action onShow)}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    await click('.trigger');
    expect(onShowTriggerSelector).to.be.equal('.trigger');
  });
});
