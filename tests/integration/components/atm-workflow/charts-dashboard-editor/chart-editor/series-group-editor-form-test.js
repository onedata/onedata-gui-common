import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewSeriesGroup } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor-form',
  function () {
    setupRenderingTest();

    it('has class "series-group-editor-form"', async function () {
      await renderComponent();

      expect(find('.series-group-editor-form')).to.exist;
    });

    it('has two fields - "name" and "stack series" and "show series sum"', async function () {
      await renderComponent();

      const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
      expect(fields).to.have.length(3);

      expect(fields[0].querySelector('.control-label')).to.contain.text('Name');
      expect(fields[0].querySelector('input[type="text"]')).to.exist;

      expect(fields[1].querySelector('.control-label')).to.contain.text('Stack series');
      expect(fields[1].querySelector('.one-way-toggle')).to.exist;

      expect(fields[2].querySelector('.control-label')).to.contain.text('Show series sum');
      expect(fields[2].querySelector('.one-way-toggle')).to.exist;
    });

    it('shows series group data in fields', async function () {
      this.set('seriesGroup', createSeriesGroup(this, {
        name: 'name',
        stacked: true,
        showSum: true,
      }));

      await renderComponent();

      expect(find('.name-field .form-control')).to.have.value('name');
      expect(find('.stacked-field .one-way-toggle')).to.have.class('checked');
      expect(find('.showSum-field .one-way-toggle')).to.have.class('checked');
    });

    it('updates field values when series group data changes', async function () {
      this.set('seriesGroup', createSeriesGroup(this, {
        name: 'name',
        stacked: true,
        showSum: true,
      }));
      await renderComponent();

      this.set('seriesGroup.name', 'name2');
      await settled();

      expect(find('.name-field .form-control')).to.have.value('name2');

      this.set('seriesGroup.stacked', false);
      await settled();

      expect(find('.stacked-field .one-way-toggle')).to.not.have.class('checked');

      this.set('seriesGroup.showSum', false);
      await settled();

      expect(find('.showSum-field .one-way-toggle')).to.not.have.class('checked');
    });
  }
);

function createSeriesGroup(testCase, props = {}) {
  const seriesGroup = createNewSeriesGroup(testCase.owner.lookup('service:i18n'));
  setProperties(seriesGroup, props);
  return seriesGroup;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor-form
    seriesGroup=seriesGroup
    actionsFactory=actionsFactory
  }}`);
}
