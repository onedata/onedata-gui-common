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
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import { Promise, resolve, reject } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { A } from '@ember/array';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import suppressRejections from '../../../helpers/suppress-rejections';

describe('Integration | Component | modals/record selector modal', function () {
  setupComponentTest('modals/record-selector-modal', {
    integration: true,
  });

  suppressRejections();

  beforeEach(function () {
    // space is before group to test sorting records by name
    const records = A([{
      name: 'space1',
      constructor: {
        modelName: 'space',
      },
    }, {
      name: 'group1',
      constructor: {
        modelName: 'group',
      },
    }]);

    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      records,
      modalOptions: {
        recordsPromise: resolve(records),
        headerText: 'Select group',
        descriptionText: 'Some description:',
        submitText: 'Apply',
        selectorPlaceholderText: 'Select...',
      },
    });
  });

  it(
    'renders modal with class "record-selector-modal", correct header and footer',
    function () {
      return showModal(this)
        .then(() => {
          const $modalFooter = getModalFooter();
          const $cancel = $modalFooter.find('.record-selector-cancel');
          expect(getModal()).to.have.class('record-selector-modal');
          expect(getModalHeader().find('h1').text().trim()).to.equal('Select group');
          expect(getModalBody().find('.description').text().trim())
            .to.equal('Some description:');
          expect($cancel.text().trim()).to.equal('Cancel');
          expect($cancel).to.not.have.attr('disabled');
          expect($modalFooter.find('.record-selector-submit').text().trim())
            .to.equal('Apply');
        });
    }
  );

  it('renders spinner when records are loading', function () {
    let recordsResolve;
    this.set(
      'modalOptions.recordsPromise',
      new Promise(resolve => recordsResolve = resolve)
    );
    const recordHelper = new RecordHelper();

    return showModal(this)
      .then(() => {
        expect(getModalBody().find('.spinner')).to.exist;
        expect(recordHelper.getTrigger()).to.not.exist;
        recordsResolve([]);
        return wait();
      })
      .then(() => expect(recordHelper.getTrigger()).to.exist);
  });

  it('renders passed dropdown placeholder', function () {
    const recordHelper = new RecordHelper();
    return showModal(this)
      .then(() =>
        expect(recordHelper.getTrigger().innerText.trim()).to.equal('Select...')
      );
  });

  it('renders passed records in dropdown', function () {
    const recordHelper = new RecordHelper();

    return showModal(this)
      .then(() => recordHelper.open())
      .then(() => {
        expect(recordHelper.getNthOption(1).innerText.trim()).to.equal('group1');
        expect(recordHelper.getNthOption(1).querySelector('.oneicon-group')).to.exist;
        expect(recordHelper.getNthOption(2).innerText.trim()).to.equal('space1');
        expect(recordHelper.getNthOption(2).querySelector('.oneicon-space')).to.exist;
      });
  });

  it('renders loading error when records cannot be loaded', function () {
    this.set('modalOptions.recordsPromise', reject('loadError'));
    const recordHelper = new RecordHelper();

    return showModal(this)
      .then(() => {
        expect(recordHelper.getTrigger()).to.not.exist;
        const $loadError = getModalBody().find('.resource-load-error');
        expect($loadError).to.exist;
        expect($loadError.text()).to.contain('loadError');
      });
  });

  it('clears selection when selected record is removed from records list', function () {
    const recordHelper = new RecordHelper();
    const records = this.get('records');

    return showModal(this)
      .then(() => recordHelper.selectOption(1))
      .then(() => {
        expect(recordHelper.getTrigger().innerText.trim()).to.equal('group1');
        records.removeObject(records.findBy('name', 'group1'));
        return wait();
      })
      .then(() => {
        expect(recordHelper.getTrigger().innerText.trim()).to.not.equal('group1');
        return recordHelper.open();
      })
      .then(() => {
        expect(recordHelper.getNthOption(1).innerText.trim()).to.equal('space1');
        expect(recordHelper.getNthOption(2)).to.not.exist;
      });
  });

  it('disables submit button when nothing is selected', function () {
    this.set('modalOptions.records', []);

    return showModal(this)
      .then(() =>
        expect(getModalFooter().find('.record-selector-submit')).to.have.attr('disabled')
      );
  });

  it('enables submit button when record is selected', function () {
    const recordHelper = new RecordHelper();

    return showModal(this)
      .then(() => recordHelper.selectOption(1))
      .then(() => expect(
        getModalFooter().find('.record-selector-submit')
      ).to.not.have.attr('disabled'));
  });

  it('submits selected record', function () {
    const recordHelper = new RecordHelper();
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    let $submitButton;
    return showModal(this)
      .then(() => recordHelper.selectOption(1))
      .then(() => {
        $submitButton = getModalFooter().find('.record-selector-submit');
        return click($submitButton[0]);
      })
      .then(() => {
        expect($submitButton).to.have.class('in-flight');
        expect(submitStub).to.be.calledOnce;
        expect(submitStub).to.be.calledWith(this.get('records')[1]);
      });
  });

  it('closes modal on cancel click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => {
        expect(onHideSpy).to.not.been.called;
        return click(getModalFooter().find('.record-selector-cancel')[0]);
      })
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('disables cancel button while submitting', function () {
    const recordHelper = new RecordHelper();
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    return showModal(this)
      .then(() => recordHelper.selectOption(1))
      .then(() => click(getModalFooter().find('.record-selector-submit')[0]))
      .then(() => expect(
        getModalFooter().find('.record-selector-cancel')
      ).to.have.attr('disabled'));
  });
});

class RecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.modal-content', 'body .ember-basic-dropdown-content');
  }
}

function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  return modalManager.show('record-selector-modal', modalOptions).shownPromise;
}
