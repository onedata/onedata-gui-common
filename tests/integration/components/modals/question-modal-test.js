import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { lookupService } from '../../../helpers/stub-service';
import { hbs } from 'ember-cli-htmlbars';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { setProperties } from '@ember/object';

describe('Integration | Component | modals/question-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {
        headerText: 'headertext',
        yesButtonText: 'Apply',
      },
    });
  });

  it('renders modal with class "question-modal", correct header and footer',
    async function () {
      await showModal(this);
      const modalFooter = getModalFooter();
      const noBtn = modalFooter.querySelector('.question-no');
      const yesBtn = modalFooter.querySelector('.question-yes');
      expect(getModal()).to.have.class('question-modal');
      expect(getModalHeader().querySelector('h1').textContent.trim())
        .to.equal('headertext');
      expect(getModalHeader().querySelector('.oneicon')).to.not.exist;
      expect(getModalBody().textContent.trim()).to.be.empty;
      expect(noBtn.textContent.trim()).to.equal('Cancel');
      expect(noBtn).to.not.have.attr('disabled');
      expect(yesBtn.textContent.trim()).to.equal('Apply');
      expect(yesBtn).to.have.class('btn-primary');
    }
  );

  it('shows specified icon in modal header', async function () {
    this.set('modalOptions.headerIcon', 'sign-warning-rounded');
    await showModal(this);
    expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
  });

  it('shows specified description paragraphs', async function () {
    this.set('modalOptions.descriptionParagraphs', [{
      text: 'p1',
      className: 'p1class',
    }, {
      text: 'p2',
    }]);

    await showModal(this);

    const paragraphs = getModalBody().querySelectorAll('p');
    expect(paragraphs).to.have.length(2);
    expect(paragraphs[0]).to.have.class('p1class');
    expect(paragraphs[0].textContent.trim()).to.equal('p1');
    expect(paragraphs[1].textContent.trim()).to.equal('p2');
  });

  it('allows to change "yes" button type', async function () {
    this.set('modalOptions.yesButtonType', 'warning');

    await showModal(this);

    const yesBtn = getModalFooter().querySelector('.question-yes');
    expect(yesBtn).to.not.have.class('btn-primary');
    expect(yesBtn).to.have.class('btn-warning');
  });

  it('shows spinner in "yes" button while submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    await showModal(this);
    const yesBtn = getModalFooter().querySelector('.question-yes');
    await click(yesBtn);
    expect(yesBtn).to.have.class('pending');
    expect(submitStub).to.be.calledOnce;
  });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;
    await click(getModalFooter().querySelector('.question-no'));
    expect(onHideSpy).to.be.calledOnce;
  });

  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    await click(getModal());
    expect(onHideSpy).to.be.calledOnce;
  });

  it('disables cancel button while submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    await showModal(this);
    await click(getModalFooter().querySelector('.question-yes'));

    expect(getModalFooter().querySelector('.question-no')).to.have.attr('disabled');
  });

  it('does not close modal on backdrop click when submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    await click(getModalFooter().querySelector('.question-yes'));
    await click(getModal());

    expect(onHideSpy).to.not.be.called;
  });

  it('does not show "understand notice" when checkboxMessage is not specified (by default)',
    async function () {
      await showModal(this);
      expect(getModalBody().querySelector('.row-understand-notice')).to.not.exist;
    }
  );

  it('shows "understand notice" and unchecked checkbox by default when checkboxMessage is specified',
    async function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      await showModal(this);
      const notice = getModalBody().querySelector('.row-understand-notice');
      expect(notice).to.exist;
      const checkbox = notice.querySelector('.one-checkbox');
      expect(checkbox).to.exist;
      expect(checkbox).to.not.have.class('checked');
      expect(notice.querySelector('.text-understand').textContent.trim())
        .to.equal('understand?');
    }
  );

  it('allows to change checkbox state by clicking on checkbox message',
    async function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      await showModal(this);
      await click(getModalBody().querySelector('.text-understand'));

      return expect(getModalBody().querySelector('.one-checkbox'))
        .to.have.class('checked');
    }
  );

  it('renders checked checkbox on open when isCheckboxInitiallyChecked option is true',
    async function () {
      setProperties(this.modalOptions, {
        checkboxMessage: 'understand?',
        isCheckboxInitiallyChecked: true,
      });

      await showModal(this);

      expect(getModalBody().querySelector('.one-checkbox'))
        .to.have.class('checked');
    }
  );

  it('disables "yes" button when checkbox is unchecked', async function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    await showModal(this);

    expect(getModalFooter().querySelector('.question-yes'))
      .to.have.attr('disabled');
  });

  it('enables "yes" button when checkbox is checked', async function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    await showModal(this);
    await click(getModalBody().querySelector('.one-checkbox'));

    expect(getModalFooter().querySelector('.question-yes')).to.not.have.attr('disabled');
  });

  it('enables "yes" button when checkbox is unchecked and isCheckboxBlocking is false',
    async function () {
      this.set('modalOptions.checkboxMessage', 'understand?');
      this.set('modalOptions.isCheckboxBlocking', false);

      await showModal(this);

      expect(getModalFooter().querySelector('.question-yes'))
        .to.not.have.attr('disabled');
    }
  );

  it('informs, that checkbox is not checked on "yes" button click', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);

    this.set('modalOptions.checkboxMessage', 'understand?');
    this.set('modalOptions.isCheckboxBlocking', false);

    await showModal(this);
    await click(getModalFooter().querySelector('.question-yes'));

    expect(submitStub).to.be.calledWith(sinon.match({
      isCheckboxChecked: false,
    }));
  });

  it('informs, that checkbox is checked on "yes" button click', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);
    this.set('modalOptions.checkboxMessage', 'understand?');
    this.set('modalOptions.isCheckboxBlocking', false);

    await showModal(this);
    await click(getModalBody().querySelector('.one-checkbox'));
    await click(getModalFooter().querySelector('.question-yes'));

    expect(submitStub).to.be.calledWith(sinon.match({
      isCheckboxChecked: true,
    }));
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `<GlobalModalMounter />`);

  return modalManager.show('question-modal', modalOptions).shownPromise;
}
