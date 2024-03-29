import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ViewWorkflowChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-workflow-chart-dashboard-action';
import {
  getModal,
  getModalHeader,
} from '../../../../helpers/modal';
import Workflow from 'onedata-gui-common/utils/workflow-visualiser/workflow';

describe('Integration | Utility | workflow-visualiser/actions/view-workflow-chart-dashboard-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const workflow = Workflow.create();
    const action = ViewWorkflowChartDashboardAction.create({
      ownerSource: this.owner,
      context: {
        workflow,
      },
    });
    this.setProperties({ workflow, action });
  });

  it('has correct className, icon and title', function () {
    expect(this.action.className)
      .to.equal('view-workflow-chart-dashboard-action-trigger');
    expect(this.action.icon).to.equal('overview');
    expect(String(this.action.title)).to.equal('Charts');
  });

  it('shows modal with workflow chart dashboard in view mode on execute', async function () {
    this.set('workflow.dashboardSpec', {
      rootSection: {
        sections: [{
          title: {
            content: 'test',
          },
        }],
      },
    });
    await executeAction(this);

    expect(getModal()).to.have.class('charts-modal');
    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Workflow chart dashboard');
  });
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  testCase.action.execute();
  await settled();
}
