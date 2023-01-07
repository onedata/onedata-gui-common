import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  settled,
  click,
  find,
  findAll
} from '@ember/test-helpers';
import { lookupService } from '../../../helpers/stub-service';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import { Promise, resolve, reject } from 'rsvp';
import { A } from '@ember/array';
import sinon from 'sinon';
import { suppressRejections } from '../../../helpers/suppress-rejections';

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

      const modalFooter = getModalFooter();
      const cancel = modalFooter.querySelector('.record-selector-cancel');
      expect(getModal()).to.have.class('record-selector-modal');
      expect(getModalHeader().querySelector('h1').textContent.trim()).to.equal('Select group');
      expect(getModalBody().querySelector('.description').textContent.trim())
        .to.equal('Some description:');
      expect(cancel.textContent.trim()).to.equal('Cancel');
      expect(cancel).to.not.have.attr('disabled');
      expect(modalFooter.querySelector('.record-selector-submit').textContent.trim())
        .to.equal('Apply');
    }
  );

  it('renders spinner when records are loading', async function () {
    let recordsResolve;
    this.set(
      'modalOptions.recordsPromise',
      new Promise(resolve => recordsResolve = resolve)
    );

    await showModal(this);

    expect(getModalBody().querySelector('.spinner')).to.exist;
    expect(find('.ember-basic-dropdown-trigger')).to.not.exist;

    recordsResolve([]);
    await settled();
    expect(find('.ember-basic-dropdown-trigger')).to.exist;
  });

  it('renders passed dropdown placeholder', async function () {
    await showModal(this);

    expect(find('.ember-basic-dropdown-trigger')).to.have.trimmed.text('Select...');
  });

  it('renders passed records in dropdown', async function () {
    await showModal(this);
    await clickTrigger('.record-selector-modal');

    const options = findAll('.ember-power-select-option');
    expect(options).to.have.length(2);
    expect(options[0]).to.have.trimmed.text('group1');
    expect(options[0].querySelector('.oneicon-group')).to.exist;
    expect(options[1]).to.have.trimmed.text('space1');
    expect(options[1].querySelector('.oneicon-space')).to.exist;
  });

  it('clears selection when selected record is removed from records list', async function () {
    const records = this.get('records');

    await showModal(this);
    await selectChoose('.record-selector-modal', 'group1');

    expect(find('.ember-basic-dropdown-trigger')).to.have.trimmed.text('group1');

    records.removeObject(records.findBy('name', 'group1'));
    await settled();
    expect(find('.ember-basic-dropdown-trigger')).to.not.have.trimmed.text('group1');

    await clickTrigger('.record-selector-modal');
    const options = findAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0]).to.have.trimmed.text('space1');
  });

  it('disables submit button when nothing is selected', async function () {
    this.set('modalOptions.records', []);

    await showModal(this);
    expect(getModalFooter().querySelector('.record-selector-submit'))
      .to.have.attr('disabled');
  });

  it('enables submit button when record is selected', async function () {
    await showModal(this);
    await selectChoose('.record-selector-modal', 'group1');

    expect(getModalFooter().querySelector('.record-selector-submit'))
      .to.not.have.attr('disabled');
  });

  it('submits selected record', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    await showModal(this);
    await selectChoose('.record-selector-modal', 'group1');

    const submitButton =
      getModalFooter().querySelector('.record-selector-submit');
    await click(submitButton);
    expect(submitButton).to.have.class('pending');
    expect(submitStub).to.be.calledOnce;
    expect(submitStub).to.be.calledWith(this.get('records')[1]);
  });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click(getModalFooter().querySelector('.record-selector-cancel'));
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
    await selectChoose('.record-selector-modal', 'group1');
    await click(getModalFooter().querySelector('.record-selector-submit'));

    expect(getModalFooter().querySelector('.record-selector-cancel'))
      .to.have.attr('disabled');
  });

  it('does not close modal on backdrop click when submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    await showModal(this);
    await selectChoose('.record-selector-modal', 'group1');
    await click(getModalFooter().querySelector('.record-selector-submit'));
    await click(getModal());

    expect(onHideSpy).to.not.be.called;
  });

  it('renders loading error when records cannot be loaded', async function () {
    suppressRejections();
    this.set('modalOptions.recordsPromise', reject('loadError'));

    await showModal(this);

    expect(find('.ember-basic-dropdown-trigger')).to.not.exist;
    const loadError = getModalBody().querySelector('.resource-load-error');
    expect(loadError).to.exist;
    expect(loadError.textContent).to.contain('loadError');
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  return modalManager.show('record-selector-modal', modalOptions).shownPromise;
}
