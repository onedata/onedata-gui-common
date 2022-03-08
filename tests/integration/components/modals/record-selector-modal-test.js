import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
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
import { A } from '@ember/array';
import sinon from 'sinon';
import suppressRejections from '../../../helpers/suppress-rejections';

describe('Integration | Component | modals/record selector modal', async function () {
  setupRenderingTest();

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
    async function () {
      await showModal(this);

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
    }
  );

  it('renders spinner when records are loading', async function () {
    let recordsResolve;
    this.set(
      'modalOptions.recordsPromise',
      new Promise(resolve => recordsResolve = resolve)
    );
    const recordHelper = new RecordHelper();

    await showModal(this);

    expect(getModalBody().find('.spinner')).to.exist;
    expect(recordHelper.getTrigger()).to.not.exist;

    recordsResolve([]);
    await settled();
    expect(recordHelper.getTrigger()).to.exist;
  });

  it('renders passed dropdown placeholder', async function () {
    const recordHelper = new RecordHelper();
    await showModal(this);

    expect(recordHelper.getTrigger().innerText.trim()).to.equal('Select...');
  });

  it('renders passed records in dropdown', async function () {
    const recordHelper = new RecordHelper();

    await showModal(this);
    await recordHelper.open();

    expect(recordHelper.getNthOption(1).innerText.trim()).to.equal('group1');
    expect(recordHelper.getNthOption(1).querySelector('.oneicon-group')).to.exist;
    expect(recordHelper.getNthOption(2).innerText.trim()).to.equal('space1');
    expect(recordHelper.getNthOption(2).querySelector('.oneicon-space')).to.exist;
  });

  it('clears selection when selected record is removed from records list', async function () {
    const recordHelper = new RecordHelper();
    const records = this.get('records');

    await showModal(this);
    await recordHelper.selectOption(1);

    expect(recordHelper.getTrigger().innerText.trim()).to.equal('group1');

    records.removeObject(records.findBy('name', 'group1'));
    await settled();
    expect(recordHelper.getTrigger().innerText.trim()).to.not.equal('group1');

    await recordHelper.open();
    expect(recordHelper.getNthOption(1).innerText.trim()).to.equal('space1');
    expect(recordHelper.getNthOption(2)).to.not.exist;
  });

  it('disables submit button when nothing is selected', async function () {
    this.set('modalOptions.records', []);

    await showModal(this);
    expect(getModalFooter().find('.record-selector-submit')).to.have.attr('disabled');
  });

  it('enables submit button when record is selected', async function () {
    const recordHelper = new RecordHelper();

    await showModal(this);
    await recordHelper.selectOption(1);

    expect(getModalFooter().find('.record-selector-submit'))
      .to.not.have.attr('disabled');
  });

  it('submits selected record', async function () {
    const recordHelper = new RecordHelper();
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    await showModal(this);
    await recordHelper.selectOption(1);

    const $submitButton = getModalFooter().find('.record-selector-submit');
    await click($submitButton[0]);
    expect($submitButton).to.have.class('pending');
    expect(submitStub).to.be.calledOnce;
    expect(submitStub).to.be.calledWith(this.get('records')[1]);
  });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModalFooter().find('.record-selector-cancel')[0]);
    expect(onHideSpy).to.be.calledOnce;
  });

  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    await click(getModal()[0]);

    expect(onHideSpy).to.be.calledOnce;
  });

  it('disables cancel button while submitting', async function () {
    const recordHelper = new RecordHelper();
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    await showModal(this);
    await recordHelper.selectOption(1);
    await click(getModalFooter().find('.record-selector-submit')[0]);

    expect(getModalFooter().find('.record-selector-cancel'))
      .to.have.attr('disabled');
  });

  it('does not close modal on backdrop click when submitting', async function () {
    const recordHelper = new RecordHelper();
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    await recordHelper.selectOption(1);
    await click(getModalFooter().find('.record-selector-submit')[0]);
    await click(getModal()[0]);

    expect(onHideSpy).to.not.be.called;
  });

  context('handles errors', async function () {
    suppressRejections();

    it('renders loading error when records cannot be loaded', async function (done) {
      this.set('modalOptions.recordsPromise', reject('loadError'));
      const recordHelper = new RecordHelper();

      await showModal(this);

      expect(recordHelper.getTrigger()).to.not.exist;
      const $loadError = getModalBody().find('.resource-load-error');
      expect($loadError).to.exist;
      expect($loadError.text()).to.contain('loadError');
      done();
    });
  });
});

class RecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.modal-content', 'body .ember-basic-dropdown-content');
  }
}

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  return modalManager.show('record-selector-modal', modalOptions).shownPromise;
}
