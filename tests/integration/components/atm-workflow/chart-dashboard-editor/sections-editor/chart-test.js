import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewChart, EditorContext } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';
import sinon from 'sinon';

describe('Integration | Component | atm-workflow/chart-dashboard-editor/sections-editor/chart', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      chart: createChart(this),
      editorContext: EditorContext.create(),
    });
  });

  it('has class "chart"', async function () {
    await renderComponent();

    expect(find('.chart')).to.exist;
  });

  it('shows title and title tip according to passed model', async function () {
    setProperties(this.chart, {
      title: 'title1',
      titleTip: 'tip1',
    });

    await renderComponent();

    expect(find('.title-content')).to.contain.text('title1');
    expect(await new OneTooltipHelper('.title-tip .one-icon').getText())
      .to.equal('tip1');
  });

  it('has floating toolbar', async function () {
    await renderComponent();

    expect(find('.floating-toolbar')).to.exist;
  });

  it('shows information about lack of configuration', async function () {
    await renderComponent();

    expect(find('.no-config-info .header'))
      .to.contain.text('This chart is not configured yet.');
    // Using innerText as the element text contains extra whitespaces
    expect(find('.no-config-info .description').innerText)
      .to.equal('Edit content to define series and axes.');
    expect(find('.no-config-info .description .edit-chart-content-trigger'))
      .to.contain.text('Edit content');
  });

  it('triggers action on action trigger click in floating toolbar', async function () {
    const executeSpy = sinon.spy();
    this.editorContext.actionsFactory = {
      createRemoveElementAction: sinon.spy(() => ({
        execute: executeSpy,
      })),
    };
    await renderComponent();
    expect(this.editorContext.actionsFactory.createRemoveElementAction).to.be.not.called;

    await click('.floating-toolbar .remove-action');

    expect(this.editorContext.actionsFactory.createRemoveElementAction).to.be.calledOnce
      .and.calledWith({ elementToRemove: this.chart });
    expect(executeSpy).to.be.calledOnce;
  });

  it('triggers editor on "edit content" link click', async function () {
    const executeSpy = sinon.spy();
    this.editorContext.actionsFactory = {
      createEditChartContentAction: sinon.spy(() => ({
        execute: executeSpy,
      })),
    };
    await renderComponent();
    expect(this.editorContext.actionsFactory.createEditChartContentAction)
      .to.be.not.called;

    await click('.edit-chart-content-trigger');

    expect(this.editorContext.actionsFactory.createEditChartContentAction)
      .to.be.calledOnce.and.calledWith({ chart: this.chart });
    expect(executeSpy).to.be.calledOnce;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/chart-dashboard-editor/sections-editor/chart
    chart=chart
    editorContext=editorContext
  }}`);
}

function createChart(testCase, props = {}) {
  const chart = createNewChart(testCase.owner.lookup('service:i18n'));
  setProperties(chart, props);
  return chart;
}
