import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ModifyLaneChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-chart-dashboard-action';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import { initialDashboardSpec } from '../../../../helpers/chart-dashboard.editor';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { Promise } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Utility | workflow-visualiser/actions/modify-lane-chart-dashboard-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const lane = Lane.create();
    const action = ModifyLaneChartDashboardAction.create({
      ownerSource: this.owner,
      context: {
        lane,
      },
    });
    this.setProperties({ lane, action });
  });

  it('has correct className, icon and title', function () {
    expect(this.action.className)
      .to.equal('modify-lane-chart-dashboard-action-trigger');
    expect(this.action.icon).to.equal('overview');
    expect(String(this.action.title)).to.equal('Configure charts');
  });

  it('shows modal with lane chart dashboard in edit mode on execute', async function () {
    this.set('lane.dashboardSpec', {
      rootSection: {
        sections: [{
          title: {
            content: 'test',
          },
        }],
      },
    });
    await executeAction(this);

    expect(getModal()).to.have.class('chart-dashboard-editor-modal');
    expect(getModalHeader().querySelector('h1'))
      .to.have.trimmed.text('Lane chart dashboard editor');
    expect(getModal()).to.have.class('mode-edit');
    const dashboardEditor = getModalBody().querySelector('.chart-dashboard-editor');
    expect(dashboardEditor).to.contain.text('test');
    expect(dashboardEditor).to.not.have.class('read-only');
  });

  it('returns promise with cancelled ActionResult after execute() and modal close using "Close"',
    async function () {
      const { resultPromise } = await executeAction(this);

      await click(getModalFooter().querySelector('.btn-close'));
      const actionResult = await resultPromise;

      expect(actionResult.status).to.equal('cancelled');
    }
  );

  it('executes modifying chart dashboard on submit and returns promise with successful ActionResult',
    async function () {
      const modifyStub = sinon.stub(this.get('lane'), 'modify').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalBody().querySelector('.create-btn'));
      await click(getModalFooter().querySelector('.btn-submit'));
      const actionResult = await resultPromise;

      expect(modifyStub).to.be.calledOnce.and.to.be.calledWith({
        dashboardSpec: initialDashboardSpec,
      });
      expect(actionResult.status).to.equal('done');
    }
  );

  it('executes modifying chart dashboard on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectModify;
      const modifyStub = sinon.stub(this.get('lane'), 'modify')
        .returns(new Promise((resolve, reject) => rejectModify = reject));

      const { resultPromise } = await executeAction(this);
      await click(getModalBody().querySelector('.create-btn'));
      await click(getModalFooter().querySelector('.btn-submit'));
      rejectModify();
      await settled();
      const actionResult = await resultPromise;

      expect(modifyStub).to.be.calledOnce;
      expect(actionResult.status).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.action.execute();
  await settled();
  return { resultPromise };
}
