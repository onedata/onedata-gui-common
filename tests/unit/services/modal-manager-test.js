import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Unit | Service | modal manager', function () {
  setupTest('service:modal-manager', {});

  it('hide() returns promise even if show() has not been called', function () {
    const service = this.subject();

    expect(service.hide().constructor.name).to.equal('Promise');
  });

  it('hides already shown modal when another show() has been called', function () {
    const modal1Options = { a: 1 };
    const modal2Options = { b: 2 };
    let modal1Hidden = false;
    let modal2Shown = false;

    const service = this.subject();
    const {
      shownPromise,
      hiddenPromise,
    } = service.show('modal1', modal1Options);

    hiddenPromise.then(() => modal1Hidden = true);

    return wait()
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.true;

        // Simulate modal 'shown' event
        service.onModalShown();
        return shownPromise;
      })
      .then(() => {
        // Open modal while another is already opened
        service.show('modal2', modal2Options).shownPromise
          .then(() => modal2Shown = true);
      })
      .then(() => {
        // Second modal has not replaced the first one yet
        expect(get(service, 'modalComponentName')).to.equal('modal1');
        expect(get(service, 'modalOptions')).to.deep.equal(modal1Options);

        // The first modal should close
        expect(get(service, 'isModalOpened')).to.be.false;

        // Simulate modal 'hidden' event
        service.onModalHidden();
        return wait();
      })
      .then(() => {
        expect(modal1Hidden).to.be.true;

        // The second modal should open
        expect(get(service, 'modalComponentName')).to.equal('modal2');
        expect(get(service, 'modalOptions')).to.deep.equal(modal2Options);
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(modal2Shown).to.be.false;

        // Simulate modal 'shown' event
        service.onModalShown();
        return wait();
      })
      .then(() => {
        expect(modal2Shown).to.be.true;
      });
  });

  it('hides currently showing modal when another show() has been called', function () {
    const modal1Options = { a: 1 };
    const modal2Options = { b: 2 };
    let modal1Hidden = false;
    let modal2Shown = false;

    const service = this.subject();
    service.show('modal1', modal1Options).hiddenPromise
      .then(() => modal1Hidden = true);

    return wait()
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.true;

        // Open modal while another is opening (but not opened yet)
        service.show('modal2', modal2Options).shownPromise
          .then(() => modal2Shown = true);
      })
      .then(() => {
        // Second modal has not replaced the first one yet
        expect(get(service, 'modalComponentName')).to.equal('modal1');
        expect(get(service, 'modalOptions')).to.deep.equal(modal1Options);

        // The first modal should close
        expect(get(service, 'isModalOpened')).to.be.false;

        // Simulate modal lifecycle when hiding before shown (see discovery test in one-modal tests)
        service.onModalShown();
        service.onModalHidden();
        return wait();
      })
      .then(() => {
        expect(modal1Hidden).to.be.true;

        // The second modal should open
        expect(get(service, 'modalComponentName')).to.equal('modal2');
        expect(get(service, 'modalOptions')).to.deep.equal(modal2Options);
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(modal2Shown).to.be.false;

        // Simulate modal 'shown' event
        service.onModalShown();
        return wait();
      })
      .then(() => {
        expect(modal2Shown).to.be.true;
      });
  });

  it('throws error on twice show() call in the same runloop frame', function () {
    const modal1Options = { a: 1 };
    let modal1Hidden = false;
    let twiceShowError;

    const service = this.subject();

    service.show('modal1', modal1Options).hiddenPromise
      .then(() => modal1Hidden = true);
    try {
      service.show('modal2');
    } catch (error) {
      twiceShowError = error;
    }

    expect(twiceShowError).to.exist;
    expect(twiceShowError.message).to.equal(
      'modal-manager: You tried to render modal twice in the same runloop frame. First modal component: modal1, second modal component: modal2.'
    );
    return wait()
      .then(() => {
        // First modal should open
        expect(get(service, 'modalComponentName')).to.equal('modal1');
        expect(get(service, 'modalOptions')).to.deep.equal(modal1Options);
        expect(get(service, 'isModalOpened')).to.be.true;

        service.onModalShown();
        return wait();
      })
      .then(() => {
        // Does not try to hide first modal or change it to the second one
        expect(get(service, 'modalComponentName')).to.equal('modal1');
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(modal1Hidden).to.be.false;

        // Simulate first modal close
        service.onModalHide();
        return wait();
      })
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.false;

        service.onModalHidden();
        return wait();
      })
      .then(() => {
        expect(modal1Hidden).to.be.true;
        // Does not try to open the second modal
        expect(get(service, 'isModalOpened')).to.be.false;
      });
  });
});
