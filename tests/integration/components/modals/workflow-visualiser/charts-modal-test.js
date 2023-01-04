import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, click, find, fillIn } from '@ember/test-helpers';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';

describe('Integration | Component | modals/workflow-visualiser/charts-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {},
    });
  });

  it('renders modal with class "charts-modal"', async function () {
    await showModal(this);

    expect(getModal()).to.have.class('charts-modal');
  });

  it('has header correct for lane dashboard', async function () {
    this.set('modalOptions.dashboardOwnerType', 'lane');
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Lane charts dashboard');
  });

  it('has header correct for workflow dashboard', async function () {
    this.set('modalOptions.dashboardOwnerType', 'workflow');
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Workflow charts dashboard');
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('modalOptions.mode', 'edit');
    });

    it('has a cancel and a save button in the footer', async function () {
      await showModal(this);

      const modalFooter = getModalFooter();
      const cancelBtn = modalFooter.querySelector('.btn-cancel');
      const saveBtn = modalFooter.querySelector('.btn-submit');

      expect(cancelBtn).to.have.class('btn-default');
      expect(cancelBtn).to.have.trimmed.text('Cancel');
      expect(saveBtn).to.have.class('btn-primary');
      expect(saveBtn).to.have.trimmed.text('Save');
    });

    it('has no tabs selector and shows "definition" tab', async function () {
      await showModal(this);

      expect(getModalBody().querySelector('.nav-tabs')).to.not.exist;
      expect(getModalBody().querySelector('.charts-visualisation')).to.not.exist;
      expect(getModalBody().querySelector('.charts-definition')).to.exist;
    });

    it('shows dashboard definition content', async function () {
      const dashboardSpec = this.set('modalOptions.dashboardSpec', {
        rootSection: {
          charts: [],
        },
      });
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);

      await showModal(this);

      expect(find('textarea')).to.have.value(stringifiedDashboardSpec);
    });

    it('does not allow to save dashboard definition when it is incorrect', async function () {
      const stringifiedDashboardSpec = '{';
      const submitSpy = this.set('modalOptions.onSubmit', sinon.spy());

      await showModal(this);

      await fillIn('textarea', stringifiedDashboardSpec);
      expect(find('.btn-submit')).to.have.attr('disabled');
      await click('.btn-submit');
      expect(submitSpy).to.not.have.been.called;
    });

    it('allows to save dashboard definition', async function () {
      const dashboardSpec = {
        rootSection: {
          charts: [],
        },
      };
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);
      const submitSpy = this.set('modalOptions.onSubmit', sinon.spy());

      await showModal(this);

      await fillIn('textarea', stringifiedDashboardSpec);
      await click('.btn-submit');
      expect(submitSpy).to.have.been.calledOnce
        .and.to.have.been.calledWith(sinon.match(dashboardSpec));
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('modalOptions.mode', 'view');
    });

    it('has no footer', async function () {
      await showModal(this);

      expect(getModalFooter()).to.not.exist;
    });

    it('has tabs selector and shows "visualisation" tab by default', async function () {
      await showModal(this);

      const tabs = getTabs();
      expect(tabs).to.have.length(2);
      expect(tabs[0]).to.have.trimmed.text('Visualisation');
      expect(tabs[0].parentElement).to.have.class('active');
      expect(tabs[1]).to.have.trimmed.text('Definition');
      expect(getModalBody().querySelector('.charts-visualisation')).to.exist;
      expect(getModalBody().querySelector('.charts-definition')).to.not.exist;
    });

    it('allows to change tab to "definition"', async function () {
      await showModal(this);

      const definitionTab = getTabs()[1];
      await click(definitionTab);
      expect(definitionTab.parentElement).to.have.class('active');
      expect(getModalBody().querySelector('.charts-visualisation')).to.not.exist;
      expect(getModalBody().querySelector('.charts-definition')).to.exist;
    });

    it('shows dashboard definition content in readonly editor', async function () {
      const dashboardSpec = this.set('modalOptions.dashboardSpec', {
        rootSection: {
          charts: [],
        },
      });
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);

      await showModal(this);
      const definitionTab = getTabs()[1];
      await click(definitionTab);

      const textarea = find('textarea');
      expect(textarea).to.have.value(stringifiedDashboardSpec);
      expect(textarea).to.have.attr('readonly');
    });
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('workflow-visualiser/charts-modal', modalOptions)
    .shownPromise;
}

function getTabs() {
  return [...getModalBody().querySelectorAll('.nav-tabs .nav-link')];
}
