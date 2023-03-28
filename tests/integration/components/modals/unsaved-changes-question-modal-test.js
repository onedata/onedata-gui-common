import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import OneTooltipHelper from '../../../helpers/one-tooltip';

describe('Integration | Component | modals/unsaved-changes-question-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {},
    });
  });

  it('renders modal with class "unsaved-changes-question-modal", correct icon, header, content and footer',
    async function () {
      await showModal(this);

      const modal = getModal();
      const modalHeader = getModalHeader();
      const modalBody = getModalBody();

      expect(modal).to.have.class('unsaved-changes-question-modal');

      expect(modalHeader.querySelector('.oneicon'))
        .to.have.class('oneicon-sign-warning-rounded');
      expect(modalHeader.querySelector('h1').textContent.trim())
        .to.equal('There are unsaved changes');

      expect(modalBody.querySelector('.disclaimer').textContent.trim()).to.equal(
        'Your changes will be lost if you don\'t save them.'
      );

      const dontSaveBtn = getButton('dont-save');
      const cancelBtn = getButton('cancel');
      const saveBtn = getButton('save');

      expect(dontSaveBtn.textContent.trim()).to.equal('Don\'t save');
      expect(dontSaveBtn).to.not.have.attr('disabled');
      expect(dontSaveBtn).to.have.class('btn-default');
      expect(cancelBtn.textContent.trim()).to.equal('Cancel');
      expect(cancelBtn).to.not.have.attr('disabled');
      expect(cancelBtn).to.have.class('btn-default');
      expect(saveBtn.textContent.trim()).to.equal('Save');
      expect(saveBtn).to.not.have.attr('disabled');
      expect(saveBtn).to.have.class('btn-primary');
    });

  it('submits "{ shouldSaveChanges: true }" after "save" click, disables all buttons and shows spinner in "save" button while submitting',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      await showModal(this);
      const saveBtn = getButton('save');
      const dontSaveBtn = getButton('dont-save');

      await click(saveBtn);

      expect(saveBtn).to.have.class('pending');
      expect(dontSaveBtn).to.not.have.class('pending');
      expect(areAllButtonsDisabled()).to.be.true;
      expect(submitStub).to.be.calledOnce.and.to.be.calledWith({
        shouldSaveChanges: true,
      });
    });

  it('submits "{ shouldSaveChanges: false }" after "don\'t save" click, disables all buttons and shows spinner in "don\'t save" button while submitting',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      await showModal(this);
      const saveBtn = getButton('save');
      const dontSaveBtn = getButton('dont-save');

      await click(dontSaveBtn);

      expect(saveBtn).to.not.have.class('pending');
      expect(dontSaveBtn).to.have.class('pending');
      expect(areAllButtonsDisabled()).to.be.true;
      expect(submitStub).to.be.calledOnce.and.to.be.calledWith({
        shouldSaveChanges: false,
      });
    });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getButton('cancel'));
    expect(onHideSpy).to.be.calledOnce;
  });

  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await click(getModal());
    expect(onHideSpy).to.be.calledOnce;
  });

  it('does not close modal on backdrop click when submitting via "save" button',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click(getButton('save'));
      await click(getModal());

      expect(onHideSpy).to.not.be.called;
    });

  it('does not close modal on backdrop click when submitting via "don\'t save" button',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click(getButton('dont-save'));
      await click(getModal());

      expect(onHideSpy).to.not.be.called;
    });

  it('disables "save" button with tooltip attached when "saveDisabledReason" is provided',
    async function () {
      this.set('modalOptions.saveDisabledReason', 'abc');

      await showModal(this);

      expect(getButton('save')).to.have.attr('disabled');
      expect(await (new OneTooltipHelper(getButton('save').parentElement)).getText())
        .to.equal('abc');
    }
  );
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  return await modalManager
    .show('unsaved-changes-question-modal', modalOptions)
    .shownPromise;
}

function getButton(btnName) {
  return getModalFooter().querySelector(`.question-${btnName}`);
}

function areAllButtonsDisabled() {
  const dontSaveBtn = getButton('dont-save');
  const cancelBtn = getButton('cancel');
  const saveBtn = getButton('save');

  return [dontSaveBtn, cancelBtn, saveBtn]
    .every((btn) => Boolean(btn.disabled));
}
