import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { initialDashboardSpec } from '../../../../helpers/charts-dashboard.editor';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { lookupService } from '../../../../helpers/stub-service';

describe('Integration | Component | modals/workflow-visualiser/charts-dashboard-editor-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    const onModifySpy = sinon.spy(() => resolve());
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {
        dashboardOwner: Workflow.create({
          onModify: onModifySpy,
        }),
      },
      onModifySpy,
    });
  });

  it('renders modal with class "charts-dashboard-editor-modal"', async function () {
    await showModal(this);

    expect(getModal()).to.have.class('charts-dashboard-editor-modal');
  });

  it('has header correct for lane dashboard', async function () {
    this.set('modalOptions.dashboardOwner', Lane.create());
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Lane charts dashboard editor');
  });

  it('has header correct for workflow dashboard', async function () {
    this.set('modalOptions.dashboardOwner', Workflow.create());
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Workflow charts dashboard editor');
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('modalOptions.mode', 'edit');
    });

    it('has only a close button in the footer when nothing is modified',
      async function () {
        await showModal(this);

        const modalFooter = getModalFooter();
        const closeBtn = modalFooter.querySelector('.btn-close');

        expect(closeBtn).to.have.class('btn-default');
        expect(closeBtn).to.have.trimmed.text('Close');
        expect(modalFooter.querySelectorAll('button')).to.have.length(1);
      });

    it('has a discard and an apply button in the footer when something is modified',
      async function () {
        await showModal(this);
        await click(getModalBody().querySelector('.create-btn'));

        const modalFooter = getModalFooter();
        const discardBtn = modalFooter.querySelector('.btn-cancel');
        const applyBtn = modalFooter.querySelector('.btn-submit');

        expect(discardBtn).to.have.class('btn-warning');
        expect(discardBtn).to.have.trimmed.text('Discard');
        expect(applyBtn).to.have.class('btn-primary');
        expect(applyBtn).to.have.trimmed.text('Apply');
        expect(modalFooter.querySelectorAll('button')).to.have.length(2);
      });

    it('shows dashboard definition content', async function () {
      this.set('modalOptions.dashboardOwner', Workflow.create({
        dashboardSpec: {
          rootSection: {
            title: { content: 'testDashboard' },
          },
        },
      }));

      await showModal(this);

      expect(find('.section-title')).to.contain.text('testDashboard');
    });

    it('allows to save dashboard definition', async function () {
      const submitSpy = this.set('modalOptions.onSubmit', sinon.spy());

      await showModal(this);

      await click(getModalBody().querySelector('.create-btn'));
      await click(getModalFooter().querySelector('.btn-submit'));
      this.modalOptions.dashboardOwner
        .chartsDashboardEditorModelContainer.propagateChange();
      expect(submitSpy).to.have.been.calledOnce;
      expect(this.onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.modalOptions.dashboardOwner, {
          dashboardSpec: initialDashboardSpec,
        });
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

    it('shows dashboard definition content in readonly editor', async function () {
      this.set('modalOptions.dashboardOwner', Workflow.create({
        dashboardSpec: {
          rootSection: {
            title: { content: 'testDashboard' },
          },
        },
      }));

      await showModal(this);

      expect(find('.section-title')).to.contain.text('testDashboard');
      expect(find('.charts-dashboard-editor')).to.have.class('read-only');
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
    .show('workflow-visualiser/charts-dashboard-editor-modal', modalOptions)
    .shownPromise;
}
