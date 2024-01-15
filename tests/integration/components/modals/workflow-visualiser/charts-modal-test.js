import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@ember/test-helpers';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
} from '../../../../helpers/modal';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';

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
    this.set('modalOptions.dashboardOwner', Lane.create());
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Lane charts dashboard');
  });

  it('has header correct for workflow dashboard', async function () {
    this.set('modalOptions.dashboardOwner', Workflow.create());
    await showModal(this);

    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Workflow charts dashboard');
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
