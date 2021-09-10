import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | modals/unsaved changes question modal', function () {
  setupComponentTest('modals/unsaved-changes-question-modal', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {},
    });
  });

  it('renders modal with class "unsaved-changes-question-modal", correct icon, header, content and footer',
    async function () {
      await showModal(this);

      const $modal = getModal();
      const $modalHeader = getModalHeader();
      const $modalBody = getModalBody();

      expect($modal).to.have.class('unsaved-changes-question-modal');

      expect($modalHeader.find('.oneicon'))
        .to.have.class('oneicon-sign-warning-rounded');
      expect($modalHeader.find('h1').text().trim())
        .to.equal('You have unsaved changes');

      expect($modalBody.find('.disclaimer').text().trim()).to.equal(
        'Your changes will be lost if you don\'t save them.'
      );

      const $dontSaveBtn = getButton('dont-save');
      const $cancelBtn = getButton('cancel');
      const $saveBtn = getButton('save');

      expect($dontSaveBtn.text().trim()).to.equal('Don\'t save');
      expect($dontSaveBtn).to.not.have.attr('disabled');
      expect($dontSaveBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Cancel');
      expect($cancelBtn).to.not.have.attr('disabled');
      expect($cancelBtn).to.have.class('btn-default');
      expect($saveBtn.text().trim()).to.equal('Save');
      expect($saveBtn).to.not.have.attr('disabled');
      expect($saveBtn).to.have.class('btn-primary');
    });

  it('submits "{ shouldSaveChanges: true }" after "save" click, disables all buttons and shows spinner in "save" button while submitting',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      await showModal(this);
      const $saveBtn = getButton('save');
      const $dontSaveBtn = getButton('dont-save');

      await click($saveBtn[0]);

      expect($saveBtn).to.have.class('in-flight');
      expect($dontSaveBtn).to.not.have.class('in-flight');
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
      const $saveBtn = getButton('save');
      const $dontSaveBtn = getButton('dont-save');

      await click($dontSaveBtn[0]);

      expect($saveBtn).to.not.have.class('in-flight');
      expect($dontSaveBtn).to.have.class('in-flight');
      expect(areAllButtonsDisabled()).to.be.true;
      expect(submitStub).to.be.calledOnce.and.to.be.calledWith({
        shouldSaveChanges: false,
      });
    });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getButton('cancel')[0]);
    expect(onHideSpy).to.be.calledOnce;
  });

  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await click(getModal()[0]);
    expect(onHideSpy).to.be.calledOnce;
  });

  it('does not close modal on backdrop click when submitting via "save" button',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click(getButton('save')[0]);
      await click(getModal()[0]);

      expect(onHideSpy).to.not.be.called;
    });

  it('does not close modal on backdrop click when submitting via "don\'t save" button',
    async function () {
      const submitStub = sinon.stub().returns(new Promise(() => {}));
      this.set('modalOptions.onSubmit', submitStub);
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click(getButton('dont-save')[0]);
      await click(getModal()[0]);

      expect(onHideSpy).to.not.be.called;
    });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  return await modalManager
    .show('unsaved-changes-question-modal', modalOptions)
    .shownPromise;
}

function getButton(btnName) {
  return getModalFooter().find(`.question-${btnName}`);
}

function areAllButtonsDisabled() {
  const $dontSaveBtn = getButton('dont-save');
  const $cancelBtn = getButton('cancel');
  const $saveBtn = getButton('save');

  return [$dontSaveBtn, $cancelBtn, $saveBtn]
    .every(($btn) => Boolean($btn.attr('disabled')));
}
