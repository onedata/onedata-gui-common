import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ViewWorkflowChartsDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-workflow-charts-dashboard-action';
import {
  getModal,
  getModalHeader,
  getModalBody,
} from '../../../../helpers/modal';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';

describe('Integration | Utility | workflow visualiser/actions/view workflow charts dashboard action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const workflow = Workflow.create();
    const action = ViewWorkflowChartsDashboardAction.create({
      ownerSource: this.owner,
      context: {
        workflow,
      },
    });
    this.setProperties({ workflow, action });
  });

  it('has correct className, icon and title', function () {
    expect(this.action.className)
      .to.equal('view-workflow-charts-dashboard-action-trigger');
    expect(this.action.icon).to.equal('overview');
    expect(String(this.action.title)).to.equal('Charts');
  });

  it('shows modal with workflow charts dashboard in view mode on execute', async function () {
    const dashboardSpec = this.set('workflow.dashboardSpec', {
      rootSection: {
        charts: [],
      },
    });
    await executeAction(this);

    expect(getModal()).to.have.class('charts-modal');
    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Workflow charts dashboard');
    expect(getModal()).to.have.class('mode-view');
    expect(getModalBody().querySelector('.charts-visualisation')).to.exist;

    await click(getModalBody().querySelectorAll('.nav-tabs .nav-link')[1]);
    const dashboardTextarea = getModalBody().querySelector('textarea');
    expect(dashboardTextarea).to.have.value(JSON.stringify(dashboardSpec, null, 2));
    expect(dashboardTextarea).to.have.attr('readonly');
  });
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  testCase.action.execute();
  await settled();
}
