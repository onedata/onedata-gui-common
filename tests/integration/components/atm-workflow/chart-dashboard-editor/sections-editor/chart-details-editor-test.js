import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import sinon from 'sinon';
import { createNewChart, EditorContext } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

describe('Integration | Component | atm-workflow/chart-dashboard-editor/sections-editor/chart-details-editor',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('editorContext', EditorContext.create());
    });

    it('has class "chart-details-editor"', async function () {
      await renderComponent();

      expect(find('.chart-details-editor')).to.exist;
    });

    it('has two fields - title and title tip', async function () {
      await renderComponent();

      const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
      expect(fields).to.have.length(2);

      expect(fields[0].querySelector('.control-label')).to.contain.text('Title');
      expect(fields[0].querySelector('input[type="text"]')).to.exist
        .and.to.have.attr('placeholder', 'No title');

      expect(fields[1].querySelector('.control-label')).to.contain.text('Title tip');
      expect(fields[1].querySelector('textarea')).to.exist
        .and.to.have.attr('placeholder', 'No title tip');
    });

    it('shows chart data in fields', async function () {
      this.set('chart', createChart(this, {
        title: 'title',
        titleTip: 'tip',
      }));

      await renderComponent();

      expect(find('.title-field .form-control')).to.have.value('title');
      expect(find('.titleTip-field .form-control')).to.have.value('tip');
    });

    it('updates field values when chart data changes', async function () {
      this.set('chart', createChart(this, {
        title: 'title',
        titleTip: 'tip',
      }));
      await renderComponent();

      this.set('chart.title', 'title2');
      await settled();

      expect(find('.title-field .form-control')).to.have.value('title2');

      this.set('chart.titleTip', 'tip2');
      await settled();

      expect(find('.titleTip-field .form-control')).to.have.value('tip2');
    });

    it('triggers chart editor on "edit content" button click', async function () {
      const chart = this.set('chart', createChart(this));
      const executeSpy = sinon.spy();
      this.editorContext.actionsFactory = {
        createEditChartContentAction: sinon.spy(() => ({
          execute: executeSpy,
        })),
      };
      await renderComponent();
      expect(this.editorContext.actionsFactory.createEditChartContentAction)
        .to.be.not.called;

      await click('.edit-content');

      expect(this.editorContext.actionsFactory.createEditChartContentAction)
        .to.be.calledOnce.and.calledWith({ chart });
      expect(executeSpy).to.be.calledOnce;
    });
  }
);

function createChart(testCase, props = {}) {
  const chart = createNewChart(testCase.owner.lookup('service:i18n'));
  setProperties(chart, props);
  return chart;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/chart-dashboard-editor/sections-editor/chart-details-editor
    editorContext=editorContext
    chart=chart
  }}`);
}
