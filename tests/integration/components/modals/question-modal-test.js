import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { lookupService } from '../../../helpers/stub-service';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Component | modals/question modal', function () {
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

  it(
    'renders modal with class "question-modal", correct header and footer',
    function () {
      return showModal(this)
        .then(() => {
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
        });
    }
  );

  it('shows specified icon in modal header', function () {
    this.set('modalOptions.headerIcon', 'sign-warning-rounded');

    return showModal(this)
      .then(() =>
        expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded'))
        .to.exist
      );
  });

  it('shows specified description paragraphs', function () {
    this.set('modalOptions.descriptionParagraphs', [{
      text: 'p1',
      className: 'p1class',
    }, {
      text: 'p2',
    }]);

    return showModal(this)
      .then(() => {
        const paragraphs = getModalBody().querySelectorAll('p');
        expect(paragraphs).to.have.length(2);
        expect(paragraphs[0]).to.have.class('p1class');
        expect(paragraphs[0].textContent.trim()).to.equal('p1');
        expect(paragraphs[1].textContent.trim()).to.equal('p2');
      });
  });

  it('allows to change "yes" button type', function () {
    this.set('modalOptions.yesButtonType', 'warning');

    return showModal(this)
      .then(() => {
        const yesBtn = getModalFooter().querySelector('.question-yes');
        expect(yesBtn).to.not.have.class('btn-primary');
        expect(yesBtn).to.have.class('btn-warning');
      });
  });

  it('shows spinner in "yes" button while submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    let yesBtn;
    return showModal(this)
      .then(() => {
        yesBtn = getModalFooter().querySelector('.question-yes');
        return click(yesBtn);
      })
      .then(() => {
        expect(yesBtn).to.have.class('pending');
        expect(submitStub).to.be.calledOnce;
      });
  });

  it('closes modal on cancel click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => {
        expect(onHideSpy).to.not.been.called;
        return click(getModalFooter().querySelector('.question-no'));
      })
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('closes modal on backdrop click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModal()))
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('disables cancel button while submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    return showModal(this)
      .then(() => click(getModalFooter().querySelector('.question-yes')))
      .then(() => expect(
        getModalFooter().querySelector('.question-no')
      ).to.have.attr('disabled'));
  });

  it('does not close modal on backdrop click when submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModalFooter().querySelector('.question-yes')))
      .then(() => click(getModal()))
      .then(() => expect(onHideSpy).to.not.be.called);
  });

  it(
    'does not show "understand notice" when checkboxMessage is not specified (by default)',
    function () {
      return showModal(this)
        .then(() => expect(getModalBody().querySelector('.row-understand-notice')).to.not.exist);
    }

  );

  it(
    'shows "understand notice" when checkboxMessage is specified',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      return showModal(this)
        .then(() => {
          const notice = getModalBody().querySelector('.row-understand-notice');
          expect(notice).to.exist;
          const checkbox = notice.querySelector('.one-checkbox');
          expect(checkbox).to.exist;
          expect(checkbox).to.not.have.class('checked');
          expect(notice.querySelector('.text-understand').textContent.trim())
            .to.equal('understand?');
        });
    }
  );

  it(
    'allows to change checkbox state by clicking on checkbox message',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      return showModal(this)
        .then(() => click(getModalBody().querySelector('.text-understand')))
        .then(() =>
          expect(getModalBody().querySelector('.one-checkbox'))
          .to.have.class('checked')
        );
    }
  );

  it('disables "yes" button when checkbox is unchecked', function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    return showModal(this)
      .then(() =>
        expect(getModalFooter().querySelector('.question-yes'))
        .to.have.attr('disabled')
      );
  });

  it('enables "yes" button when checkbox is checked', function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    return showModal(this)
      .then(() => click(getModalBody().querySelector('.one-checkbox')))
      .then(() =>
        expect(getModalFooter().querySelector('.question-yes'))
        .to.not.have.attr('disabled')
      );
  });

  it(
    'enables "yes" button when checkbox is unchecked and isCheckboxBlocking is false',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');
      this.set('modalOptions.isCheckboxBlocking', false);

      return showModal(this)
        .then(() =>
          expect(getModalFooter().querySelector('.question-yes')).to.not.have.attr('disabled')
        );
    }
  );

  it('informs, that checkbox is not checked on "yes" button click', function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);

    this.set('modalOptions.checkboxMessage', 'understand?');
    this.set('modalOptions.isCheckboxBlocking', false);

    return showModal(this)
      .then(() => click(getModalFooter().querySelector('.question-yes')))
      .then(() => expect(submitStub).to.be.calledWith(sinon.match({
        isCheckboxChecked: false,
      })));
  });

  it('informs, that checkbox is checked on "yes" button click', function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);

    this.set('modalOptions.checkboxMessage', 'understand?');
    this.set('modalOptions.isCheckboxBlocking', false);

    return showModal(this)
      .then(() => click(getModalBody().querySelector('.one-checkbox')))
      .then(() => click(getModalFooter().querySelector('.question-yes')))
      .then(() => expect(submitStub).to.be.calledWith(sinon.match({
        isCheckboxChecked: true,
      })));
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  return modalManager.show('question-modal', modalOptions).shownPromise;
}
