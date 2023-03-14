import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import { lookupService } from '../../../../helpers/stub-service';

describe('Integration | Component | modals/workflow-visualiser/remove-store-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('helper', new Helper(this));
  });

  it('renders modal with class "remove-store-modal"', async function () {
    await this.helper.render();

    expect(this.helper.modal).to.have.class('remove-store-modal');
  });

  it('renders correct modal header and footer with buttons', async function () {
    await this.helper.render();

    expect(this.helper.modalHeader).to.contain.text('Remove store');
    expect(this.helper.cancelBtn).to.have.class('question-no')
      .and.to.have.class('btn-default')
      .and.to.have.trimmed.text('Cancel')
      .and.to.not.have.attr('disabled');
    expect(this.helper.removeBtn).to.have.class('question-yes')
      .and.to.have.class('btn-danger')
      .and.to.have.trimmed.text('Remove')
      .and.to.not.have.attr('disabled');
  });

  it('renders simple modal body when store is not referenced by anything', async function () {
    this.helper.modalOptions.store.referencingRecords = [];

    await this.helper.render();

    expect(this.helper.mainText).to.equal(
      'You are about to delete the store store1.'
    );
    expect(this.helper.referencesListText).to.deep.equal([]);
    expect(this.helper.secondaryText).to.be.undefined;
  });

  it('renders modal body with references list when store is referenced by some records', async function () {
    this.helper.modalOptions.store.referencingRecords = [{
      __modelType: 'lane',
      name: 'lane1',
    }, {
      __modelType: 'task',
      name: 'task1',
    }];

    await this.helper.render();

    expect(this.helper.mainText).to.match(
      /^You are about to delete the store store1.\s+It is used by the elements below:$/
    );
    expect(this.helper.referencesListText).to.deep.equal([
      'Lane lane1',
      'Task task1',
    ]);
    expect(this.helper.secondaryText).to.equal(
      'These elements will require manual configuration adjustments after store removal. Are you sure?'
    );
  });

  it('informs about "remove" click', async function () {
    await this.helper.render();
    expect(this.helper.modalOptions.onSubmit).to.be.not.called;

    await click(this.helper.removeBtn);

    expect(this.helper.modalOptions.onSubmit).to.be.calledOnce;
  });

  it('blocks controls when "remove" click handler is pending', async function () {
    this.helper.modalOptions.onSubmit = sinon.stub()
      .returns(new Promise(() => {}));
    await this.helper.render();

    await click(this.helper.removeBtn);

    expect(this.helper.cancelBtn).to.have.attr('disabled');
    expect(this.helper.removeBtn).to.have.attr('disabled');
  });

  it('closes modal on "cancel" click', async function () {
    await this.helper.render();
    expect(this.helper.onHideSpy).to.not.been.called;

    await click(this.helper.cancelBtn);

    expect(this.helper.onHideSpy).to.be.calledOnce;
  });

  it('closes modal on modal backdrop click', async function () {
    await this.helper.render();
    expect(this.helper.onHideSpy).to.not.been.called;

    await click(this.helper.modal);

    expect(this.helper.onHideSpy).to.be.calledOnce;
  });

  it('does not close modal on modal backdrop click when "remove" click handler is pending',
    async function () {
      this.helper.modalOptions.onSubmit = sinon.stub()
        .returns(new Promise(() => {}));
      await this.helper.render();

      await click(this.helper.removeBtn);
      await click(this.helper.modal);

      expect(this.helper.onHideSpy).to.be.not.called;
    }
  );
});

class Helper {
  get modalManager() {
    return lookupService(this.mochaContext, 'modal-manager');
  }

  get modal() {
    return getModal();
  }

  get modalHeader() {
    return getModalHeader();
  }

  get modalFooterButtons() {
    return getModalFooter().querySelectorAll('button');
  }

  get cancelBtn() {
    return getModalFooter().querySelector('.question-no');
  }

  get removeBtn() {
    return getModalFooter().querySelector('.question-yes');
  }

  get mainText() {
    return getModalBody().querySelector('p')?.textContent.trim();
  }

  get referencesListText() {
    return [...getModalBody().querySelectorAll('li')]
      .map((li) => li.textContent.trim());
  }

  get secondaryText() {
    return getModalBody().querySelector('ul + p')?.textContent.trim();
  }

  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.modalOptions = {
      store: {
        name: 'store1',
      },
      onSubmit: sinon.stub().resolves(),
    };
    this.onHideSpy = sinon.spy(this.modalManager, 'onModalHide');
  }

  async render() {
    await render(hbs `{{global-modal-mounter}}`);

    await this.modalManager
      .show('workflow-visualiser/remove-store-modal', this.modalOptions)
      .shownPromise;
  }
}
