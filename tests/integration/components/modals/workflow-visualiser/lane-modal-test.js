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
import sinon from 'sinon';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { setProperties } from '@ember/object';
import { Promise } from 'rsvp';
import { selectChoose } from 'ember-power-select/test-support/helpers';

const simpliestLane = {
  name: 'lane1',
  maxRetries: 0,
  storeIteratorSpec: {
    storeSchemaId: 's1',
    maxBatchSize: 100,
  },
};

describe('Integration | Component | modals/workflow-visualiser/lane-modal', function () {
  setupRenderingTest();

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

    it('shows correct header, form in "create" mode and footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Create new lane');
      expect(getModalBody().querySelector('.lane-form')).to.have.class('mode-create')
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

        await fillIn('.name-field .form-control', 'lane1');
        expect(submitBtn.disabled).to.be.false;

        await fillIn('.name-field .form-control', '');
        expect(submitBtn.disabled).to.be.true;
        done();
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

    it('shows correct header, form in "edit" mode and footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Modify lane');
      const form = getModalBody().querySelector('.lane-form');
      expect(form).to.have.class('mode-edit').and.to.have.class('form-enabled');
      expect(form.querySelector('.name-field .form-control'))
        .to.have.value(simpliestLane.name);
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

    it('shows correct header, form in "view" mode and footer', async function (done) {
      await showModal(this);

      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('Lane details');
      const form = getModalBody().querySelector('.lane-form');
      expect(form).to.have.class('mode-view');
      expect(form.querySelector('.name-field .field-component').textContent.trim())
        .to.equal(simpliestLane.name);
      const modalFooter = getModalFooter();
      const cancelBtn = modalFooter.querySelector('.btn-cancel');
      const submitBtn = modalFooter.querySelector('.btn-submit');
      expect(cancelBtn).to.have.class('btn-default');
      expect(cancelBtn.textContent.trim()).to.equal('Close');
      expect(submitBtn).to.not.exist;
      done();
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

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('workflow-visualiser/lane-modal', modalOptions)
    .shownPromise;
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

function itInjectsCreateStoreAction() {
  it('injects createStoreAction to form', async function (done) {
    const executeStub = sinon.stub().resolves({ status: 'failed' });
    this.set('modalOptions.createStoreAction', { execute: executeStub });

    await showModal(this);

    expect(executeStub).to.not.be.called;
    await selectChoose('.sourceStore-field', 'Create store...');

    expect(executeStub).to.be.calledOnce;
    done();
  });
}

function itPassesLaneProvidedByFormOnSubmit(fillForm = () => {}, expectedData) {
  it('passes lane from form on submit', async function (done) {
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

    expect(getModalBody().querySelector('.lane-form')).to.have.class('form-disabled');
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
