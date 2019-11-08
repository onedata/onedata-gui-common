import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe('Unit | Service | modal manager', function () {
  setupTest('service:modal-manager', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  it('hide() returns promise even if show() has not been called', function () {
    const service = this.subject();

    expect(service.hide().constructor.name).to.equal('Promise');
  });

  it('hides already shown modal when another show() has been called', function () {
    const component1Options = { a: 1 };
    const component2Options = { b: 2 };

    const service = this.subject();

    let component1Hidden = false;
    let component2Shown = false;
    const {
      shownPromise,
      hiddenPromise,
    } = service.show('component1', component1Options);

    hiddenPromise.then(() => {
      component1Hidden = true;
    });

    return wait()
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.true;
        service.onModalShown();
        return shownPromise;
      })
      .then(() => {
        // Open modal while another is already opened
        service.show('component2', component2Options).shownPromise
          .then(() => component2Shown = true);
      })
      .then(() => {
        expect(get(service, 'modalComponentName')).to.equal('component1');
        expect(get(service, 'modalOptions')).to.deep.equal(component1Options);
        // The first modal should close
        expect(get(service, 'isModalOpened')).to.be.false;

        service.onModalHidden();
        return wait();
      })
      .then(() => {
        expect(component1Hidden).to.be.true;
        expect(get(service, 'modalComponentName')).to.equal('component2');
        expect(get(service, 'modalOptions')).to.deep.equal(component2Options);
        // The second modal should open
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(component2Shown).to.be.false;

        service.onModalShown();
        return wait();
      })
      .then(() => {
        expect(component2Shown).to.be.true;
      });
  });

  it('cancels current showing modal when another show() has been called', function () {
    const component1Options = { a: 1 };
    const component2Options = { b: 2 };

    const service = this.subject();

    let component1Hidden = false;
    let component2Shown = false;
    service.show('component1', component1Options).hiddenPromise.then(() => {
      component1Hidden = true;
    });

    return wait()
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.true;
        // Open modal while another is opening (but not opened yet)
        service.show('component2', component2Options).shownPromise
          .then(() => component2Shown = true);
      })
      .then(() => {
        // The first modal should be already removed, because it was not shown
        expect(get(service, 'modalComponentName')).to.equal(null);
        expect(get(service, 'modalOptions')).to.deep.equal({});
        expect(get(service, 'isModalOpened')).to.be.false;

        return wait();
      })
      .then(() => {
        expect(component1Hidden).to.be.true;
        // The second modal should open
        expect(get(service, 'modalComponentName')).to.equal('component2');
        expect(get(service, 'modalOptions')).to.deep.equal(component2Options);
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(component2Shown).to.be.false;

        service.onModalShown();
        return wait();
      })
      .then(() => {
        expect(component2Shown).to.be.true;
      });
  });

  it('throws error on twice show() call in the same runloop frame', function () {
    const component1Options = { a: 1 };
    let component1Hidden = false;
    let twiceShowError;

    const service = this.subject();

    service.show('component1', component1Options).hiddenPromise
      .then(() => component1Hidden = true);
    try {
      service.show('component2');
    } catch (error) {
      twiceShowError = error;
    }

    expect(twiceShowError).to.exist;
    expect(twiceShowError.message).to.equal(
      'modal-manager: You tried to render modal twice in the same runloop frame. First modal component: component1, second modal component: component2.'
    );
    return wait()
      .then(() => {
        expect(get(service, 'modalComponentName')).to.equal('component1');
        expect(get(service, 'modalOptions')).to.deep.equal(component1Options);
        expect(get(service, 'isModalOpened')).to.be.true;

        service.onModalShown();
        return wait();
      })
      .then(() => {
        // Does not try to hide first modal or change it to the second one
        expect(get(service, 'modalComponentName')).to.equal('component1');
        expect(get(service, 'isModalOpened')).to.be.true;
        expect(component1Hidden).to.be.false;

        service.onModalHide();
        return wait();
      })
      .then(() => {
        expect(get(service, 'isModalOpened')).to.be.false;
        service.onModalHidden();
        return wait();
      })
      .then(() => {
        expect(component1Hidden).to.be.true;
      });
  });
});
