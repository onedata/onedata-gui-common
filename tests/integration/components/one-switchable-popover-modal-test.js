import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';

const CONTENT_TEXT = 'contentText';
const WINDOW_WIDTH_LG = 1000;
const WINDOW_WIDTH_SM = 400;

describe('Integration | Component | one switchable popover modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('contentText', CONTENT_TEXT);
    this.set('_window', {
      resizeListener: null,
      innerWidth: WINDOW_WIDTH_LG,
      addEventListener(event, listener) {
        this.resizeListener = listener;
      },
      removeEventListener() {
        this.resizeListener = null;
      },
    });
  });

  it('renders content', async function (done) {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        triggersConfiguration=".trigger"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    expect($('body')).to.not.contain(CONTENT_TEXT);
    this.$('.trigger').click();
    wait().then(() => {
      expect($('body')).to.contain(CONTENT_TEXT);
      done();
    });
  });

  it('reacts to window resize', async function (done) {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        _window=_window
        popoverClass="popover-element"
        modalClass="modal-element"
        triggersConfiguration=".trigger"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    this.$('.trigger').click();
    wait().then(() => {
      expect($('.popover-element')).to.exist;
      expect($('.modal-element')).to.not.exist;
      this.set('_window.innerWidth', WINDOW_WIDTH_SM);
      this.get('_window.resizeListener')();
      wait().then(() => {
        expect($('.popover-element')).to.not.exist;
        expect($('.modal-element')).to.exist;
        this.set('_window.innerWidth', WINDOW_WIDTH_LG);
        this.get('_window.resizeListener')();
        wait().then(() => {
          expect($('.popover-element')).to.exist;
          expect($('.modal-element')).to.not.exist;
          done();
        });
      });
    });
  });

  it('emits events onShow, onShown', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      expect(showOccurred).to.be.true;
      expect(shownOccurred).to.be.true;
      done();
    });
  });

  it('emits events onHide, onHidden', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      this.$('.trigger').click();
      wait().then(() => {
        expect(hideOccurred).to.be.true;
        expect(hiddenOccurred).to.be.true;
        done();
      });
    });
  });

  it('shows and hides popover on trigger click', async function (done) {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        popoverClass="popover-element"
        triggersConfiguration=".trigger:popover"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    this.$('.trigger').click();
    wait().then(() => {
      expect($('.in .popover-element')).to.exist;
      this.$('.trigger').click();
      wait().then(() => {
        expect($('.out .popover-element')).to.exist;
        done();
      });
    });
  });

  it('hides popover on outside click', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      this.$('.container').click();
      wait().then(() => {
        expect($('.out .popover-element')).to.exist;
        done();
      });
    });
  });

  it('does not hide popover on content click', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      $('.content-button').click();
      wait().then(() => {
        expect($('.in .popover-element')).to.exist;
        done();
      });
    });
  });

  it('shows and hides modal', async function (done) {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        modalClass="modal-element"
        triggersConfiguration=".trigger:modal"}}
        {{contentText}}
      {{/one-switchable-popover-modal}}
    `);

    this.$('.trigger').click();
    wait().then(() => {
      expect($('.modal-element.in')).to.exist;
      // click on backdrop
      click($('.modal')[0]).then(() => {
        expect($('.modal-element.in')).to.not.exist;
        done();
      });
    });
  });

  it('does not hide modal on content click', async function (done) {
    await render(hbs `
      <button class="trigger">Trigger</button>
      {{#one-switchable-popover-modal
        modalTransitionDuration=0
        modalClass="modal-element"
        triggersConfiguration=".trigger:modal"}}
        <button class="content-button">Click me</button>
      {{/one-switchable-popover-modal}}
    `);

    this.$('.trigger').click();
    wait().then(() => {
      $('.content-button').click();
      wait().then(() => {
        expect($('.modal-element.in')).to.exist;
        done();
      });
    });
  });

  it('handles with different triggers', async function (done) {
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

    this.$('.trigger-popover').click();
    wait().then(() => {
      expect($('.in .popover-element')).to.exist;
      $('.trigger-modal').click();
      wait().then(() => {
        expect($('.modal-element.in')).to.exist;
        expect($('.popover-element')).to.not.exist;
        done();
      });
    });
  });

  it('sets appropriate classes', async function (done) {
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

    this.$('.trigger-popover').click();
    wait().then(() => {
      expect($('.popover-element.component-element')).to.exist;
      $('.trigger-modal').click();
      wait().then(() => {
        expect($('.modal-element.component-element')).to.exist;
        done();
      });
    });
  });

  it('can be controlled by open property', async function (done) {
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

    expect($('.in .popover-element')).to.not.exist;
    this.set('open', true);
    wait().then(() => {
      expect($('.in .popover-element')).to.exist;
      this.set('open', false);
      wait().then(() => {
        expect($('.in .popover-element')).to.not.exist;
        done();
      });
    });
  });

  it('does not hide if onHide returns false', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      this.$('.trigger').click();
      wait().then(() => {
        expect($('.in .popover-element')).to.exist;
        done();
      });
    });
  });

  it('does not show if onShow returns false', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      expect($('.in .popover-element')).to.not.exist;
      done();
    });
  });

  it('can reattach content to another trigger while using open property',
    async function (done) {
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

      wait().then(() => {
        expect($('.modal-element.in')).to.exist;
        this.set('activeTriggerSelector', '.trigger-popover');
        wait().then(() => {
          expect($('body')).to.not.have.class('modal-open');
          expect($('.in .popover-element')).to.exist;
          done();
        });
      });
    }
  );

  it('can react to triggersConfiguration change', async function (done) {
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

    this.$('.trigger-modal').click();
    wait().then(() => {
      expect($('.modal-element.in')).to.exist;
      this.set('triggersConfiguration', '.trigger-popover:popover');
      wait().then(() => {
        expect($('.modal-element.in')).to.not.exist;
        this.$('.trigger-popover').click();
        wait().then(() => {
          expect($('.in .popover-element')).to.exist;
          done();
        });
      });
    });
  });

  it('passes trigger selector via onShow argument', async function (done) {
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

    this.$('.trigger').click();
    wait().then(() => {
      expect(onShowTriggerSelector).to.be.equal('.trigger');
      done();
    });
  });
});
