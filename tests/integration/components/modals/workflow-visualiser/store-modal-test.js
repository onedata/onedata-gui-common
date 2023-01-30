import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { setProperties } from '@ember/object';
import sinon from 'sinon';
import { Promise, resolve } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';

const simplestStore = {
  name: 'store1',
  description: '',
  type: 'list',
  config: {
    itemDataSpec: {
      type: 'number',
      valueConstraints: {},
    },
  },
  defaultInitialContent: null,
  requiresInitialContent: false,
};

describe('Integration | Component | modals/workflow visualiser/store modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {},
    });
  });

  it('renders modal with class "store-modal"', async function () {
    await showModal(this);

    expect(getModal()).to.have.class('store-modal');
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('modalOptions.mode', 'create');
    });

    it('shows correct header, form in "create" mode and footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Create new store');
      expect(getModalBody().querySelector('.store-form')).to.have.class('mode-create')
        .and.to.have.class('form-enabled');
      const modalFooter = getModalFooter();
      const cancelBtn = modalFooter.querySelector('.btn-cancel');
      const submitBtn = modalFooter.querySelector('.btn-submit');
      expect(cancelBtn).to.have.class('btn-default');
      expect(cancelBtn.textContent.trim()).to.equal('Cancel');
      expect(submitBtn).to.have.class('btn-primary');
      expect(submitBtn.textContent.trim()).to.equal('Create');
      done();
    });

    it('disables submit when form is invalid and enables it, when becomes valid',
      async function (done) {
        await showModal(this);

        const submitBtn = getModalFooter().querySelector('.btn-submit');
        expect(submitBtn.disabled).to.be.true;

        await fillIn('.name-field .form-control', 'store1');
        await selectChoose('.data-spec-editor', 'Number');
        expect(submitBtn.disabled).to.be.false;

        await fillIn('.name-field .form-control', '');
        expect(submitBtn.disabled).to.be.true;
        done();
      });

    itDoesNotShowTabs();
    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();

    const fillForm = async () => {
      await fillIn('.name-field .form-control', 'store1');
      await selectChoose('.data-spec-editor', 'Number');
    };
    itPassesStoreProvidedByFormOnSubmit(fillForm, simplestStore);
    itDisablesAllControlsWhileSubmitting(fillForm);
    itDoesNotCloseModalOnBackdropClickWhenSubmitting(fillForm);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'edit',
        store: Store.create(simplestStore),
      });
    });

    it('shows correct header, form in "edit" mode and footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Modify store');
      const form = getModalBody().querySelector('.store-form');
      expect(form).to.have.class('mode-edit').and.to.have.class('form-enabled');
      expect(form.querySelector('.name-field .form-control'))
        .to.have.value(simplestStore.name);
      const modalFooter = getModalFooter();
      const cancelBtn = modalFooter.querySelector('.btn-cancel');
      const submitBtn = modalFooter.querySelector('.btn-submit');
      expect(cancelBtn).to.have.class('btn-default');
      expect(cancelBtn.textContent.trim()).to.equal('Cancel');
      expect(submitBtn).to.have.class('btn-primary');
      expect(submitBtn.textContent.trim()).to.equal('OK');
      done();
    });

    it('disables submit when form is invalid and enables it, when becomes valid',
      async function (done) {
        await showModal(this);

        const submitBtn = getModalFooter().querySelector('.btn-submit');
        expect(submitBtn.disabled).to.be.false;

        await fillIn('.name-field .form-control', 'anothername');
        expect(submitBtn.disabled).to.be.false;

        await fillIn('.name-field .form-control', '');
        expect(submitBtn.disabled).to.be.true;
        done();
      });

    itDoesNotShowTabs();
    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();
    const fillForm = async () =>
      await fillIn('.name-field .form-control', 'store2');
    itPassesStoreProvidedByFormOnSubmit(fillForm, Object.assign({}, simplestStore, {
      name: 'store2',
    }));
    itDisablesAllControlsWhileSubmitting();
    itDoesNotCloseModalOnBackdropClickWhenSubmitting();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'view',
        store: Store.create(simplestStore),
        getStoreContentCallback: () => resolve({ array: [], isLast: true }),
      });
    });

    it('shows correct header, form in "view" mode and no footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Store details');
      const form = getModalBody().querySelector('.store-form');
      expect(form).to.have.class('mode-view');
      expect(form.querySelector('.name-field .field-component').textContent.trim())
        .to.equal(simplestStore.name);
      expect(getModalFooter()).to.not.exist;
      done();
    });

    it('shows tabs with "details" tab preselected', async function (done) {
      await showModal(this);

      const tabs = getModalBody().querySelectorAll('.bs-tab-onedata .nav-link');
      expect(tabs).to.have.length(2);
      expect(tabs[0].textContent.trim()).to.equal('Details');
      expect(tabs[1].textContent.trim()).to.equal('Content');
      expect(tabs[0].parentElement).to.have.class('active');
      expect(getModalBody().querySelector('.store-form')).to.exist;
      done();
    });

    it('closes modal on "x" click', async function (done) {
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

      await showModal(this);
      expect(onHideSpy).to.not.been.called;

      await click(getModalHeader().querySelector('.close'));
      expect(onHideSpy).to.be.calledOnce;
      done();
    });

    itClosesModalOnBackdropClick();
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('workflow-visualiser/store-modal', modalOptions)
    .shownPromise;
  if (testCase.get('modalOptions.mode') === 'view') {
    await click(getModalBody().querySelector('.bs-tab-onedata .nav-link'));
  }
}

function itDoesNotShowTabs() {
  it('does not show tabs', async function (done) {
    await showModal(this);

    expect(getModalBody().querySelector('.bs-tab-onedata')).to.not.exist;
    done();
  });
}

function itClosesModalOnCancelClick() {
  it('closes modal on cancel click', async function (done) {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModalFooter().querySelector('.btn-cancel'));
    expect(onHideSpy).to.be.calledOnce;
    done();
  });
}

function itClosesModalOnBackdropClick() {
  it('closes modal on backdrop click', async function (done) {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModal());
    expect(onHideSpy).to.be.calledOnce;
    done();
  });
}

function itPassesStoreProvidedByFormOnSubmit(fillForm = () => {}, expectedData) {
  it('passes store from form on submit', async function (done) {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().querySelector('.btn-submit'));

    expect(submitStub).to.be.calledWith(expectedData);
    done();
  });
}

function itDisablesAllControlsWhileSubmitting(fillForm = () => {}) {
  it('disables all controls while submitting', async function (done) {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().querySelector('.btn-submit'));

    expect(getModalBody().querySelector('.store-form'))
      .to.have.class('form-disabled');
    const modalFooter = getModalFooter();
    expect(modalFooter.querySelector('.btn-cancel')).to.have.attr('disabled');
    expect(modalFooter.querySelector('.btn-submit')).to.have.attr('disabled');
    done();
  });
}

function itDoesNotCloseModalOnBackdropClickWhenSubmitting(fillForm = () => {}) {
  it('does not close modal on backdrop click when submitting', async function (done) {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().querySelector('.btn-submit'));
    await click(getModal());

    expect(onHideSpy).to.not.be.called;
    done();
  });
}
