import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';

describe('Integration | Component | modals/question modal', function () {
  setupComponentTest('modals/question-modal', {
    integration: true,
  });

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
          const $modalFooter = getModalFooter();
          const $noBtn = $modalFooter.find('.question-no');
          const $yesBtn = $modalFooter.find('.question-yes');
          expect(getModal()).to.have.class('question-modal');
          expect(getModalHeader().find('h1').text().trim()).to.equal('headertext');
          expect(getModalHeader().find('.oneicon')).to.not.exist;
          expect(getModalBody().text().trim()).to.be.empty;
          expect($noBtn.text().trim()).to.equal('Cancel');
          expect($noBtn).to.not.have.attr('disabled');
          expect($yesBtn.text().trim()).to.equal('Apply');
          expect($yesBtn).to.have.class('btn-primary');
        });
    }
  );

  it('shows specified icon in modal header', function () {
    this.set('modalOptions.headerIcon', 'sign-warning-rounded');

    return showModal(this)
      .then(() =>
        expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist
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
        const $paragraphs = getModalBody().find('p');
        expect($paragraphs).to.have.length(2);
        expect($paragraphs.eq(0)).to.have.class('p1class');
        expect($paragraphs.eq(0).text().trim()).to.equal('p1');
        expect($paragraphs.eq(1).text().trim()).to.equal('p2');
      });
  });

  it('allows to change "yes" button classes', function () {
    this.set('modalOptions.yesButtonClassName', 'btn-warning');

    return showModal(this)
      .then(() => {
        const $yesBtn = getModalFooter().find('.question-yes');
        expect($yesBtn).to.not.have.class('btn-primary');
        expect($yesBtn).to.have.class('btn-warning');
        expect($yesBtn).to.have.class('btn');
      });
  });

  it('shows spinner in "yes" button while submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    let $yesBtn;
    return showModal(this)
      .then(() => {
        $yesBtn = getModalFooter().find('.question-yes');
        return click($yesBtn[0]);
      })
      .then(() => {
        expect($yesBtn).to.have.class('in-flight');
        expect(submitStub).to.be.calledOnce;
      });
  });

  it('closes modal on cancel click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => {
        expect(onHideSpy).to.not.been.called;
        return click(getModalFooter().find('.question-no')[0]);
      })
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('closes modal on backdrop click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModal()[0]))
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('disables cancel button while submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    return showModal(this)
      .then(() => click(getModalFooter().find('.question-yes')[0]))
      .then(() => expect(
        getModalFooter().find('.question-no')
      ).to.have.attr('disabled'));
  });

  it('does not close modal on backdrop click when submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModalFooter().find('.question-yes')[0]))
      .then(() => click(getModal()[0]))
      .then(() => expect(onHideSpy).to.not.be.called);
  });

  it(
    'does not show "understand notice" when checkboxMessage is not specified (by default)',
    function () {
      return showModal(this)
        .then(() => expect(getModalBody().find('.row-understand-notice')).to.not.exist);
    }

  );

  it(
    'shows "understand notice" when checkboxMessage is specified',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      return showModal(this)
        .then(() => {
          const $notice = getModalBody().find('.row-understand-notice');
          expect($notice).to.exist;
          const $checkbox = $notice.find('.one-checkbox');
          expect($checkbox).to.exist;
          expect($checkbox).to.not.have.class('checked');
          expect($notice.find('.text-understand').text().trim()).to.equal('understand?');
        });
    }
  );

  it(
    'allows to change checkbox state by clicking on checkbox message',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');

      return showModal(this)
        .then(() => click(getModalBody().find('.text-understand')[0]))
        .then(() =>
          expect(getModalBody().find('.one-checkbox')).to.have.class('checked')
        );
    }
  );

  it('disables "yes" button when checkbox is unchecked', function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    return showModal(this)
      .then(() =>
        expect(getModalFooter().find('.question-yes')).to.have.attr('disabled')
      );
  });

  it('enables "yes" button when checkbox is checked', function () {
    this.set('modalOptions.checkboxMessage', 'understand?');

    return showModal(this)
      .then(() => click(getModalBody().find('.one-checkbox')[0]))
      .then(() =>
        expect(getModalFooter().find('.question-yes')).to.not.have.attr('disabled')
      );
  });

  it(
    'enables "yes" button when checkbox is unchecked and isCheckboxBlocking is false',
    function () {
      this.set('modalOptions.checkboxMessage', 'understand?');
      this.set('modalOptions.isCheckboxBlocking', false);

      return showModal(this)
        .then(() =>
          expect(getModalFooter().find('.question-yes')).to.not.have.attr('disabled')
        );
    }
  );

  it('informs, that checkbox is not checked on "yes" button click', function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);

    this.set('modalOptions.checkboxMessage', 'understand?');
    this.set('modalOptions.isCheckboxBlocking', false);

    return showModal(this)
      .then(() => click(getModalFooter().find('.question-yes')[0]))
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
      .then(() => click(getModalBody().find('.one-checkbox')[0]))
      .then(() => click(getModalFooter().find('.question-yes')[0]))
      .then(() => expect(submitStub).to.be.calledWith(sinon.match({
        isCheckboxChecked: true,
      })));
  });
});

function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  return modalManager.show('question-modal', modalOptions).shownPromise;
}
