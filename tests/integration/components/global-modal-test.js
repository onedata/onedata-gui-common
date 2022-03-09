import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import $ from 'jquery';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import ModalInstance from 'onedata-gui-common/utils/modal-manager/modal-instance';
import { set } from '@ember/object';

describe('Integration | Component | global modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    const modalManager = lookupService(this, 'modal-manager');
    const modalInstance = ModalInstance.create({
      id: 'abc',
    });
    set(modalManager, 'modalInstances', [modalInstance]);
    this.setProperties({
      modalManager,
      modalInstance,
    });
  });

  it('does not render anything in place', async function () {
    await render(hbs `{{global-modal}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders modal only when modalInstance.isOpened is true', async function () {
    this.set('modalInstance.isOpened', true);

    await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    expect(isGlobalModalOpened()).to.be.true;
  });

  it('renders modal with custom class', async function () {
    this.set('modalInstance.isOpened', true);

    await render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      classNames="custom-modal-class"
    }}`);

    expect(getGlobalModal()).to.have.class('custom-modal-class');
  });

  it('hides modal if modal instance isOpened turns from true to false', async function () {
    this.set('modalInstance.isOpened', true);

    await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    this.set('modalInstance.isOpened', false);
    await settled();
    expect(isGlobalModalOpened()).to.be.false;
  });

  it('allows to render custom modal header, body and footer', async function () {
    this.set('modalInstance.isOpened', true);

    await render(hbs `
      {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
        {{#modal.header}}
          <div class="header-content-test"></div>
        {{/modal.header}}
        {{#modal.body}}
          <div class="body-content-test"></div>
        {{/modal.body}}
        {{#modal.footer}}
          <div class="footer-content-test"></div>
        {{/modal.footer}}
      {{/global-modal}}
    `);

    const modal = getGlobalModal();

    [
      '.header-content-test',
      '.body-content-test',
      '.footer-content-test',
    ].forEach(contentSelector =>
      expect(modal.find(contentSelector)).to.exist
    );
  });

  it(
    'notifies about onShown event through resolve of modalManager.show().shownPromise promise',
    async function () {
      await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

      await this.get('modalManager').show().shownPromise;
      expect(isGlobalModalOpened()).to.be.true;
    }
  );

  it(
    'notifies about onHidden event through resolve of modalManager.show().hiddenPromise promise',
    async function () {
      const hiddenSpy = sinon.spy();

      await render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      const {
        shownPromise,
        hiddenPromise,
      } = this.get('modalManager').show();

      hiddenPromise.then(hiddenSpy);
      await shownPromise;
      expect(isGlobalModalOpened()).to.be.true;
      expect(hiddenSpy).to.not.be.called;

      await click(getGlobalModal().find('.close-button')[0]);
      expect(isGlobalModalOpened()).to.be.false;
      expect(hiddenSpy).to.be.called;
    }
  );

  it(
    'notifies about onHidden event through resolve of modalManager.hide() promise',
    async function () {
      await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

      const modalManager = this.get('modalManager');
      await modalManager.show().shownPromise;
      await modalManager.hide(this.get('modalManager.modalInstances.lastObject.id'));

      expect(isGlobalModalOpened()).to.be.false;
    }
  );

  it(
    'returns the same promise for two consecutive modalManager.hide() calls',
    async function () {
      await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

      const modalManager = this.get('modalManager');
      await modalManager.show().shownPromise;

      const modalId = this.get('modalManager.modalInstances.lastObject.id');
      const promise1 = modalManager.hide(modalId);
      const promise2 = modalManager.hide(modalId);
      expect(promise1).to.equal(promise2);
    }
  );

  it('hides modal on modal.close action', async function () {
    await render(hbs `
      {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
        {{#modal.body}}
          <button class="close-button" {{action modal.close}}></button>
        {{/modal.body}}
      {{/global-modal}}
    `);

    await this.get('modalManager').show().shownPromise;
    await click(getGlobalModal().find('.close-button')[0]);

    expect(isGlobalModalOpened()).to.be.false;
  });

  it(
    'calls onHide callback passed via component property on modal.close action',
    async function () {
      const hideSpy = sinon.spy();
      this.set('hide', hideSpy);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action hide)
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager').show().shownPromise;
      await click(getGlobalModal().find('.close-button')[0]);

      expect(hideSpy).to.be.calledOnce;
      expect(isGlobalModalOpened()).to.be.false;
    }
  );

  it(
    'calls onHide callback passed via modalManager.show() on modal.close action',
    async function () {
      const hideSpy = sinon.spy();

      await render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onHide: hideSpy }).shownPromise;
      await click(getGlobalModal().find('.close-button')[0]);

      expect(hideSpy).to.be.calledOnce;
      expect(isGlobalModalOpened()).to.be.false;
    }
  );

  it(
    'does not close modal if onHide passed via property returns false',
    async function () {
      const hideSpyViaShow = sinon.spy();
      const hideStubViaProp = sinon.stub().returns(false);
      this.set('hide', hideStubViaProp);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action hide)
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onHide: hideSpyViaShow }).shownPromise;
      await click(getGlobalModal().find('.close-button')[0]);

      expect(hideStubViaProp).to.be.calledOnce;
      expect(hideSpyViaShow).to.not.be.called;
      expect(isGlobalModalOpened()).to.be.true;
    }
  );

  it(
    'does not close modal if onHide passed via show() returns false',
    async function () {
      const hideStubViaShow = sinon.stub().returns(false);
      const hideSpyViaProp = sinon.spy();
      this.set('hide', hideSpyViaProp);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action hide)
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onHide: hideStubViaShow }).shownPromise;
      await click(getGlobalModal().find('.close-button')[0]);
      expect(hideSpyViaProp).to.be.calledOnce;
      expect(hideStubViaShow).to.be.calledOnce;
      expect(isGlobalModalOpened()).to.be.true;
    }
  );

  it(
    'calls onSubmit callback passed via component property on modal.submit action',
    async function () {
      const submitSpy = sinon.spy();
      this.set('submit', submitSpy);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action submit)
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager').show().shownPromise;
      await click(getGlobalModal().find('.submit-button')[0]);

      expect(submitSpy).to.be.calledOnce;
      expect(submitSpy).to.be.calledWith('value');
    }
  );

  it(
    'calls onSubmit callback passed via show() on modal.submit action',
    async function () {
      const submitSpy = sinon.spy();

      await render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpy }).shownPromise;
      await click(getGlobalModal().find('.submit-button')[0]);

      expect(submitSpy).to.be.calledOnce;
      expect(submitSpy).to.be.calledWith('value');
    }
  );

  it(
    'calls onSubmit promise callback passed via property and then via show() on modal.submit action',
    async function () {
      let resolveSpyViaProp;
      let resolveSpyViaShow;
      const allSubmitsResolvedSpy = sinon.spy();
      const submitSpyViaProp = sinon.spy(value => {
        if (value === 'value') {
          return new Promise(resolve => {
            resolveSpyViaProp = resolve;
          });
        }
      });
      const submitSpyViaShow = sinon.spy(value => {
        if (value === 'value2') {
          return new Promise(resolve => {
            resolveSpyViaShow = resolve;
          }).then(allSubmitsResolvedSpy);
        }
      });
      this.set('submit', submitSpyViaProp);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action submit)
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpyViaShow }).shownPromise;
      await click(getGlobalModal().find('.submit-button')[0]);

      expect(submitSpyViaProp).to.be.calledOnce;
      expect(submitSpyViaProp).to.be.calledWith('value');
      expect(submitSpyViaShow).to.not.be.called;
      resolveSpyViaProp('value2');
      await settled();

      expect(submitSpyViaShow).to.be.calledOnce;
      expect(submitSpyViaShow).to.be.calledWith('value2');
      expect(allSubmitsResolvedSpy).to.not.be.called;
      resolveSpyViaShow('value3');
      await settled();

      expect(allSubmitsResolvedSpy).to.be.calledOnce;
      expect(allSubmitsResolvedSpy).to.be.calledWith('value3');
    }
  );

  it(
    'does not call onSubmit callback passed via show() when onSubmit passed via property rejects on modal.submit action',
    async function () {
      const submitStubViaProp = sinon.stub().rejects();
      const submitSpyViaShow = sinon.spy();

      this.set('submit', submitStubViaProp);

      await render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action submit)
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpyViaShow }).shownPromise;
      await click(getGlobalModal().find('.submit-button')[0]);

      expect(submitStubViaProp).to.be.calledOnce;
      expect(submitSpyViaShow).to.not.be.called;
    }
  );

  it('closes modal on modal.submit', async function () {
    await render(hbs `
      {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
        {{#modal.body}}
          <button class="submit-button" {{action modal.submit}}></button>
        {{/modal.body}}
      {{/global-modal}}
    `);

    await this.get('modalManager').show().shownPromise;
    await click(getGlobalModal().find('.submit-button')[0]);

    expect(isGlobalModalOpened()).to.be.false;
  });

  it(
    'does not close modal on modal.submit when hideAfterSubmit show() option is false',
    async function () {
      await render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      await this.get('modalManager')
        .show('someComponent', { hideAfterSubmit: false }).shownPromise;
      await click(getGlobalModal().find('.submit-button')[0]);

      expect(isGlobalModalOpened()).to.be.true;
    }
  );

  it('closes modal on Escape key press by default', async function () {
    await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    await this.get('modalManager').show().shownPromise;
    await triggerKeyEvent(getGlobalModal()[0], 'keydown', 27);

    expect(isGlobalModalOpened()).to.be.false;
  });

  it('does not close modal on Escape key press when allowClose is false', async function () {
    await render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      allowClose=false}}
    `);

    await this.get('modalManager').show().shownPromise;
    await triggerKeyEvent(getGlobalModal()[0], 'keydown', 27);

    expect(isGlobalModalOpened()).to.be.true;
  });

  it('closes modal on backdrop click by default', async function () {
    await render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    await this.get('modalManager').show().shownPromise;
    await click(getGlobalModal()[0]);

    expect(isGlobalModalOpened()).to.be.false;
  });

  it('does not close modal on backdrop click when allowClose is false', async function () {
    await render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      allowClose=false
    }}`);

    await this.get('modalManager').show().shownPromise;
    await click(getGlobalModal()[0]);

    expect(isGlobalModalOpened()).to.be.true;
  });

  it('renders modal in specified size', async function () {
    this.set('modalInstance.isOpened', true);

    await render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      size="lg"
    }}`);

    expect(getGlobalModal().find('.modal-dialog')).to.have.class('modal-lg');
  });
});

function getGlobalModal() {
  return $('.modal.global-modal');
}

function isGlobalModalOpened() {
  const $modal = getGlobalModal();
  return $modal && $modal.hasClass('in');
}
