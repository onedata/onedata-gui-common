import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import { setProperties } from '@ember/object';
import { fillIn, click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise, resolve } from 'rsvp';

const simpliestStore = {
  name: 'store1',
  description: '',
  type: 'list',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
  defaultInitialValue: null,
  requiresInitialValue: false,
};

describe('Integration | Component | modals/workflow visualiser/store modal', function () {
  setupComponentTest('modals/workflow-visualiser/store-modal', {
    integration: true,
  });

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

    it('shows correct header, form in "create" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Create new store');
      expect(getModalBody().find('.store-form')).to.have.class('mode-create')
        .and.to.have.class('form-enabled');
      const $modalFooter = getModalFooter();
      const $cancelBtn = $modalFooter.find('.btn-cancel');
      const $submitBtn = $modalFooter.find('.btn-submit');
      expect($cancelBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Cancel');
      expect($submitBtn).to.have.class('btn-primary');
      expect($submitBtn.text().trim()).to.equal('Create');
    });

    it('disables submit when form is invalid and enables it, when becomes valid',
      async function () {
        await showModal(this);

        const $submitBtn = getModalFooter().find('.btn-submit');
        expect($submitBtn).to.be.disabled;

        await fillIn('.name-field .form-control', 'store1');
        expect($submitBtn).to.be.not.disabled;

        await fillIn('.name-field .form-control', '');
        expect($submitBtn).to.be.disabled;
      });

    itDoesNotShowTabs();
    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();

    const fillForm = async () =>
      await fillIn('.name-field .form-control', 'store1');
    itPassesStoreProvidedByFormOnSubmit(fillForm, simpliestStore);
    itDisablesAllControlsWhileSubmitting(fillForm);
    itDoesNotCloseModalOnBackdropClickWhenSubmitting(fillForm);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'edit',
        store: simpliestStore,
      });
    });

    it('shows correct header, form in "edit" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Modify store');
      const $form = getModalBody().find('.store-form');
      expect($form).to.have.class('mode-edit').and.to.have.class('form-enabled');
      expect($form.find('.name-field .form-control')).to.have.value(simpliestStore.name);
      const $modalFooter = getModalFooter();
      const $cancelBtn = $modalFooter.find('.btn-cancel');
      const $submitBtn = $modalFooter.find('.btn-submit');
      expect($cancelBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Cancel');
      expect($submitBtn).to.have.class('btn-primary');
      expect($submitBtn.text().trim()).to.equal('OK');
    });

    it('disables submit when form is invalid and enables it, when becomes valid',
      async function () {
        await showModal(this);

        const $submitBtn = getModalFooter().find('.btn-submit');
        expect($submitBtn).to.be.not.disabled;

        await fillIn('.name-field .form-control', 'anothername');
        expect($submitBtn).to.be.not.disabled;

        await fillIn('.name-field .form-control', '');
        expect($submitBtn).to.be.disabled;
      });

    itDoesNotShowTabs();
    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();
    const fillForm = async () =>
      await fillIn('.name-field .form-control', 'store2');
    itPassesStoreProvidedByFormOnSubmit(fillForm, Object.assign({}, simpliestStore, {
      name: 'store2',
    }));
    itDisablesAllControlsWhileSubmitting();
    itDoesNotCloseModalOnBackdropClickWhenSubmitting();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'view',
        store: simpliestStore,
        getStoreContentCallback: () => resolve({ array: [], isLast: true }),
      });
    });

    it('shows correct header, form in "view" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Store details');
      const $form = getModalBody().find('.store-form');
      expect($form).to.have.class('mode-view');
      expect($form.find('.name-field .field-component').text().trim())
        .to.equal(simpliestStore.name);
      const $modalFooter = getModalFooter();
      const $cancelBtn = $modalFooter.find('.btn-cancel');
      const $submitBtn = $modalFooter.find('.btn-submit');
      expect($cancelBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Close');
      expect($submitBtn).to.not.exist;
    });

    it('shows tabs with "details" tab preselected', async function () {
      await showModal(this);

      const $tabs = getModalBody().find('.bs-tab-onedata .nav-link');
      expect($tabs).to.have.length(2);
      expect($tabs.eq(0).text().trim()).to.equal('Details');
      expect($tabs.eq(1).text().trim()).to.equal('Content');
      expect($tabs.eq(0).parent()).to.have.class('active');
      expect(getModalBody().find('.store-form')).to.exist;
    });

    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('workflow-visualiser/store-modal', modalOptions)
    .shownPromise;
  if (testCase.get('modalOptions.mode') === 'view') {
    await click(getModalBody().find('.bs-tab-onedata .nav-link')[0]);
  }
}

function itDoesNotShowTabs() {
  it('does not show tabs', async function () {
    await showModal(this);

    expect(getModalBody().find('.bs-tab-onedata')).to.not.exist;
  });
}

function itClosesModalOnCancelClick() {
  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModalFooter().find('.btn-cancel')[0]);
    expect(onHideSpy).to.be.calledOnce;
  });
}

function itClosesModalOnBackdropClick() {
  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModal()[0]);
    expect(onHideSpy).to.be.calledOnce;
  });
}

function itPassesStoreProvidedByFormOnSubmit(fillForm = () => {}, expectedData) {
  it('passes store from form on submit', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().find('.btn-submit')[0]);

    expect(submitStub).to.be.calledWith(expectedData);
  });
}

function itDisablesAllControlsWhileSubmitting(fillForm = () => {}) {
  it('disables all controls while submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().find('.btn-submit')[0]);

    expect(getModalBody().find('.store-form')).to.have.class('form-disabled');
    const $modalFooter = getModalFooter();
    expect($modalFooter.find('.btn-cancel')).to.have.attr('disabled');
    expect($modalFooter.find('.btn-submit')).to.have.attr('disabled');
  });
}

function itDoesNotCloseModalOnBackdropClickWhenSubmitting(fillForm = () => {}) {
  it('does not close modal on backdrop click when submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await fillForm(this);
    await click(getModalFooter().find('.btn-submit')[0]);
    await click(getModal()[0]);

    expect(onHideSpy).to.not.be.called;
  });
}
