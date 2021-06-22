import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, keyEvent } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { ModalInstance } from 'onedata-gui-common/services/modal-manager';
import { set } from '@ember/object';

describe('Integration | Component | global modal', function () {
  setupComponentTest('global-modal', {
    integration: true,
  });

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

  it('does not render anything in place', function () {
    this.render(hbs `{{global-modal}}`);

    expect(this.$().children()).to.have.length(0);
  });

  it('renders modal only when modalInstance.isOpened is true', function () {
    this.set('modalInstance.isOpened', true);

    this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    return wait()
      .then(() => expect(isGlobalModalOpened()).to.be.true);
  });

  it('renders modal with custom class', function () {
    this.set('modalInstance.isOpened', true);

    this.render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      classNames="custom-modal-class"
    }}`);

    return wait()
      .then(() => expect(getGlobalModal()).to.have.class('custom-modal-class'));
  });

  it('hides modal if modalManager.isModalOpened turns from true to false', function () {
    this.set('modalInstance.isOpened', true);

    this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    return wait()
      .then(() => this.set('modalInstance.isOpened', false))
      .then(() => expect(isGlobalModalOpened()).to.be.false);
  });

  it('allows to render custom modal header, body and footer', function () {
    this.set('modalInstance.isOpened', true);

    this.render(hbs `
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

    return wait()
      .then(() => {
        const modal = getGlobalModal();

        [
          '.header-content-test',
          '.body-content-test',
          '.footer-content-test',
        ].forEach(contentSelector =>
          expect(modal.find(contentSelector)).to.exist
        );
      });
  });

  it(
    'notifies about onShown event through resolve of modalManager.show().shownPromise promise',
    function () {
      this.render(
        hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`
      );

      return this.get('modalManager').show().shownPromise
        .then(() => expect(isGlobalModalOpened()).to.be.true);
    }
  );

  it(
    'notifies about onHidden event through resolve of modalManager.show().hiddenPromise promise',
    function () {
      const hiddenSpy = sinon.spy();

      this.render(hbs `
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
      return shownPromise
        .then(() => {
          expect(isGlobalModalOpened()).to.be.true;
          expect(hiddenSpy).to.not.be.called;
          return click(getGlobalModal().find('.close-button')[0]);
        })
        .then(() => {
          expect(isGlobalModalOpened()).to.be.false;
          expect(hiddenSpy).to.be.called;
        });
    }
  );

  it(
    'notifies about onHidden event through resolve of modalManager.hide() promise',
    function () {
      this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

      const modalManager = this.get('modalManager');
      return modalManager.show().shownPromise
        .then(() =>
          modalManager.hide(this.get('modalManager.modalInstances.lastObject.id'))
        )
        .then(() => expect(isGlobalModalOpened()).to.be.false);
    }
  );

  it(
    'returns the same promise for two consecutive modalManager.hide() calls',
    function () {
      this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

      const modalManager = this.get('modalManager');
      return modalManager.show().shownPromise
        .then(() => {
          const modalId = this.get('modalManager.modalInstances.lastObject.id');
          const promise1 = modalManager.hide(modalId);
          const promise2 = modalManager.hide(modalId);
          expect(promise1).to.equal(promise2);
        });
    }
  );

  it('hides modal on modal.close action', function () {
    this.render(hbs `
      {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
        {{#modal.body}}
          <button class="close-button" {{action modal.close}}></button>
        {{/modal.body}}
      {{/global-modal}}
    `);

    return this.get('modalManager').show().shownPromise
      .then(() => click(getGlobalModal().find('.close-button')[0]))
      .then(() => expect(isGlobalModalOpened()).to.be.false);
  });

  it(
    'calls onHide callback passed via component property on modal.close action',
    function () {
      const hideSpy = sinon.spy();
      this.on('hide', hideSpy);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action "hide")
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager').show().shownPromise
        .then(() => click(getGlobalModal().find('.close-button')[0]))
        .then(() => {
          expect(hideSpy).to.be.calledOnce;
          expect(isGlobalModalOpened()).to.be.false;
        });
    }
  );

  it(
    'calls onHide callback passed via modalManager.show() on modal.close action',
    function () {
      const hideSpy = sinon.spy();

      this.render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onHide: hideSpy }).shownPromise
        .then(() => click(getGlobalModal().find('.close-button')[0]))
        .then(() => {
          expect(hideSpy).to.be.calledOnce;
          expect(isGlobalModalOpened()).to.be.false;
        });
    }
  );

  it(
    'does not close modal if onHide passed via property returns false',
    function () {
      const hideSpyViaShow = sinon.spy();
      const hideStubViaProp = sinon.stub().returns(false);
      this.on('hide', hideStubViaProp);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action "hide")
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onHide: hideSpyViaShow }).shownPromise
        .then(() => click(getGlobalModal().find('.close-button')[0]))
        .then(() => {
          expect(hideStubViaProp).to.be.calledOnce;
          expect(hideSpyViaShow).to.not.be.called;
          expect(isGlobalModalOpened()).to.be.true;
        });
    }
  );

  it(
    'does not close modal if onHide passed via show() returns false',
    function () {
      const hideStubViaShow = sinon.stub().returns(false);
      const hideSpyViaProp = sinon.spy();
      this.on('hide', hideSpyViaProp);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onHide=(action "hide")
          as |modal|
        }}
          {{#modal.body}}
            <button class="close-button" {{action modal.close}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onHide: hideStubViaShow }).shownPromise
        .then(() => click(getGlobalModal().find('.close-button')[0]))
        .then(() => {
          expect(hideSpyViaProp).to.be.calledOnce;
          expect(hideStubViaShow).to.be.calledOnce;
          expect(isGlobalModalOpened()).to.be.true;
        });
    }
  );

  it(
    'calls onSubmit callback passed via component property on modal.submit action',
    function () {
      const submitSpy = sinon.spy();
      this.on('submit', submitSpy);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action "submit")
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager').show().shownPromise
        .then(() => click(getGlobalModal().find('.submit-button')[0]))
        .then(() => {
          expect(submitSpy).to.be.calledOnce;
          expect(submitSpy).to.be.calledWith('value');
        });
    }
  );

  it(
    'calls onSubmit callback passed via show() on modal.submit action',
    function () {
      const submitSpy = sinon.spy();

      this.render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpy }).shownPromise
        .then(() => click(getGlobalModal().find('.submit-button')[0]))
        .then(() => {
          expect(submitSpy).to.be.calledOnce;
          expect(submitSpy).to.be.calledWith('value');
        });
    }
  );

  it(
    'calls onSubmit promise callback passed via property and then via show() on modal.submit action',
    function () {
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
      this.on('submit', submitSpyViaProp);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action "submit")
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit "value"}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpyViaShow }).shownPromise
        .then(() => click(getGlobalModal().find('.submit-button')[0]))
        .then(() => {
          expect(submitSpyViaProp).to.be.calledOnce;
          expect(submitSpyViaProp).to.be.calledWith('value');
          expect(submitSpyViaShow).to.not.be.called;
          resolveSpyViaProp('value2');
        })
        .then(() => {
          expect(submitSpyViaShow).to.be.calledOnce;
          expect(submitSpyViaShow).to.be.calledWith('value2');
          expect(allSubmitsResolvedSpy).to.not.be.called;
          resolveSpyViaShow('value3');
        })
        .then(() => {
          expect(allSubmitsResolvedSpy).to.be.calledOnce;
          expect(allSubmitsResolvedSpy).to.be.calledWith('value3');
        });
    }
  );

  it(
    'does not call onSubmit callback passed via show() when onSubmit passed via property rejects on modal.submit action',
    function () {
      const submitStubViaProp = sinon.stub().rejects();
      const submitSpyViaShow = sinon.spy();

      this.on('submit', submitStubViaProp);

      this.render(hbs `
        {{#global-modal
          modalId=modalManager.modalInstances.lastObject.id
          onSubmit=(action "submit")
          as |modal|
        }}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { onSubmit: submitSpyViaShow }).shownPromise
        .then(() => click(getGlobalModal().find('.submit-button')[0]))
        .then(() => {
          expect(submitStubViaProp).to.be.calledOnce;
          expect(submitSpyViaShow).to.not.be.called;
        });
    }
  );

  it('closes modal on modal.submit', function () {
    this.render(hbs `
      {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
        {{#modal.body}}
          <button class="submit-button" {{action modal.submit}}></button>
        {{/modal.body}}
      {{/global-modal}}
    `);

    return this.get('modalManager').show().shownPromise
      .then(() => click(getGlobalModal().find('.submit-button')[0]))
      .then(() => expect(isGlobalModalOpened()).to.be.false);
  });

  it(
    'does not close modal on modal.submit when hideAfterSubmit show() option is false',
    function () {
      this.render(hbs `
        {{#global-modal modalId=modalManager.modalInstances.lastObject.id as |modal|}}
          {{#modal.body}}
            <button class="submit-button" {{action modal.submit}}></button>
          {{/modal.body}}
        {{/global-modal}}
      `);

      return this.get('modalManager')
        .show('someComponent', { hideAfterSubmit: false }).shownPromise
        .then(() => click(getGlobalModal().find('.submit-button')[0]))
        .then(() => expect(isGlobalModalOpened()).to.be.true);
    }
  );

  it('closes modal on Escape key press by default', function () {
    this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    return this.get('modalManager').show().shownPromise
      .then(() => keyEvent(getGlobalModal()[0], 'keydown', 27))
      .then(() => expect(isGlobalModalOpened()).to.be.false);
  });

  it('does not close modal on Escape key press when allowClose is false', function () {
    this.render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      allowClose=false}}
    `);

    return this.get('modalManager').show().shownPromise
      .then(() => keyEvent(getGlobalModal()[0], 'keydown', 27))
      .then(() => expect(isGlobalModalOpened()).to.be.true);
  });

  it('closes modal on backdrop click by default', function () {
    this.render(hbs `{{global-modal modalId=modalManager.modalInstances.lastObject.id}}`);

    return this.get('modalManager').show().shownPromise
      .then(() => click(getGlobalModal()[0]))
      .then(() => expect(isGlobalModalOpened()).to.be.false);
  });

  it('does not close modal on backdrop click when allowClose is false', function () {
    this.render(hbs `{{global-modal
      modalId=modalManager.modalInstances.lastObject.id
      allowClose=false
    }}`);

    return this.get('modalManager').show().shownPromise
      .then(() => click(getGlobalModal()[0]))
      .then(() => expect(isGlobalModalOpened()).to.be.true);
  });
});

function getGlobalModal() {
  return $('.modal.global-modal');
}

function isGlobalModalOpened() {
  const $modal = getGlobalModal();
  return $modal && $modal.hasClass('in');
}
