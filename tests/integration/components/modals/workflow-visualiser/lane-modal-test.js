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
import { fillIn, click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { setProperties } from '@ember/object';
import { Promise } from 'rsvp';
import { selectChoose } from '../../../../helpers/ember-power-select';

const simpliestLane = {
  name: 'lane1',
  maxRetries: 0,
  storeIteratorSpec: {
    strategy: {
      type: 'serial',
    },
    storeSchemaId: 's1',
  },
};

describe('Integration | Component | modals/workflow visualiser/lane modal', function () {
  setupComponentTest('modals/workflow-visualiser/lane-modal', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {
        definedStores: [
          Store.create({
            id: 's1',
            name: 'store1',
          }),
          Store.create({
            id: 's2',
            name: 'store2',
          }),
        ],
      },
    });
  });

  it('renders modal with class "lane-modal"', async function () {
    await showModal(this);

    expect(getModal()).to.have.class('lane-modal');
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('modalOptions.mode', 'create');
    });

    it('shows correct header, form in "create" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Create new lane');
      expect(getModalBody().find('.lane-form')).to.have.class('mode-create')
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

        await fillIn('.name-field .form-control', 'lane1');
        expect($submitBtn).to.be.not.disabled;

        await fillIn('.name-field .form-control', '');
        expect($submitBtn).to.be.disabled;
      });

    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();

    itInjectsCreateStoreAction();
    const fillForm = async () =>
      await fillIn('.name-field .form-control', 'lane1');
    itPassesLaneProvidedByFormOnSubmit(fillForm, simpliestLane);
    itDisablesAllControlsWhileSubmitting(fillForm);
    itDoesNotCloseModalOnBackdropClickWhenSubmitting(fillForm);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'edit',
        lane: simpliestLane,
      });
    });

    it('shows correct header, form in "edit" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Modify lane');
      const $form = getModalBody().find('.lane-form');
      expect($form).to.have.class('mode-edit').and.to.have.class('form-enabled');
      expect($form.find('.name-field .form-control')).to.have.value(simpliestLane.name);
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

    itClosesModalOnCancelClick();
    itClosesModalOnBackdropClick();
    itInjectsCreateStoreAction();
    const fillForm = async () =>
      await fillIn('.name-field .form-control', 'lane2');
    itPassesLaneProvidedByFormOnSubmit(fillForm, Object.assign({}, simpliestLane, {
      name: 'lane2',
    }));
    itDisablesAllControlsWhileSubmitting();
    itDoesNotCloseModalOnBackdropClickWhenSubmitting();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      setProperties(this.get('modalOptions'), {
        mode: 'view',
        lane: simpliestLane,
      });
    });

    it('shows correct header, form in "view" mode and footer', async function () {
      await showModal(this);

      expect(getModalHeader().find('h1').text().trim()).to.equal('Lane details');
      const $form = getModalBody().find('.lane-form');
      expect($form).to.have.class('mode-view');
      expect($form.find('.name-field .field-component').text().trim())
        .to.equal(simpliestLane.name);
      const $modalFooter = getModalFooter();
      const $cancelBtn = $modalFooter.find('.btn-cancel');
      const $submitBtn = $modalFooter.find('.btn-submit');
      expect($cancelBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Close');
      expect($submitBtn).to.not.exist;
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
    .show('workflow-visualiser/lane-modal', modalOptions)
    .shownPromise;
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

function itInjectsCreateStoreAction() {
  it('injects createStoreAction to form', async function () {
    const executeStub = sinon.stub().resolves({ status: 'failed' });
    this.set('modalOptions.createStoreAction', { execute: executeStub });

    await showModal(this);

    expect(executeStub).to.not.be.called;
    await selectChoose('.sourceStore-field', 'Create store...');

    expect(executeStub).to.be.calledOnce;
  });
}

function itPassesLaneProvidedByFormOnSubmit(fillForm = () => {}, expectedData) {
  it('passes lane from form on submit', async function () {
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

    expect(getModalBody().find('.lane-form')).to.have.class('form-disabled');
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
