import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import {
  createChartModelFromSpec,
  createNewSeries,
  EditorContext,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneDropdownHelper from '../../../../../helpers/one-dropdown';

const typeDropdownHelper = new OneDropdownHelper('.type-field');
const axisDropdownHelper = new OneDropdownHelper('.axis-field');
const groupDropdownHelper = new OneDropdownHelper('.group-field');

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/series-editor-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      chart: createChartModelFromSpec({
        yAxes: [{
          id: 'a1',
          name: 'axis1',
        }, {
          id: 'a2',
          name: 'axis2',
        }],
        seriesGroupBuilders: [{
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g1',
              name: 'group1',
              subgroups: [{
                id: 'g12',
                name: 'group12',
                subgroups: [{
                  id: 'g13',
                  name: 'group123',
                }],
              }],
            },
          },
        }, {
          builderType: 'static',
          builderRecipe: {
            seriesGroupTemplate: {
              id: 'g2',
              name: 'group2',
            },
          },
        }],
      }),
      editorContext: EditorContext.create(),
    });
  });

  it('has class "series-editor-form"', async function () {
    await renderComponent();

    expect(find('.series-editor-form')).to.exist;
  });

  it('has six fields - "repeat per prefixed time series", "name", "type", "color", "axis" and "group"',
    async function () {
      await renderComponent();

      const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
      expect(fields).to.have.length(6);

      expect(fields[0].querySelector('.control-label')).to.contain.text(
        'Repeat per prefixed time series'
      );
      expect(fields[0].querySelector('.one-way-toggle')).to.exist;

      expect(fields[1].querySelector('.control-label')).to.contain.text('Name');
      expect(fields[1].querySelector('input[type="text"]')).to.exist;

      expect(fields[2].querySelector('.control-label')).to.contain.text('Type');
      expect(fields[2].querySelector('.dropdown-field')).to.exist;
      expect(await typeDropdownHelper.getOptionsText()).to.deep.equal(['Line', 'Bar']);

      expect(fields[3].querySelector('.control-label')).to.contain.text('Color');
      const radios = fields[3].querySelectorAll('.radio-inline');
      expect(radios[0]).to.contain.text('auto');
      expect(radios[1]).to.contain.text('custom');

      expect(fields[4].querySelector('.control-label')).to.contain.text('Axis');
      expect(fields[4].querySelector('.dropdown-field')).to.exist;
      expect(await axisDropdownHelper.getOptionsText()).to.deep.equal(['axis1', 'axis2']);

      expect(fields[5].querySelector('.control-label')).to.contain.text('Group');
      expect(fields[5].querySelector('.dropdown-field')).to.exist;
      expect(await groupDropdownHelper.getOptionsText()).to.deep.equal([
        'None',
        'group1',
        'group12 (in group1)',
        'group123 (in group1 > group12)',
        'group2',
      ]);
    }
  );

  it('shows series data in fields', async function () {
    this.set('series', createSeries(this, {
      name: 'abc',
      type: 'line',
      color: null,
      axis: this.chart.axes[0],
      group: this.chart.seriesGroups[1],
    }));

    await renderComponent();

    expect(find('.name-field .form-control')).to.have.value('abc');
    expect(typeDropdownHelper.getSelectedOptionText()).to.equal('Line');
    expect(find('.colorType-field .option-auto input'))
      .to.have.property('checked', true);
    expect(axisDropdownHelper.getSelectedOptionText()).to.equal('axis1');
    expect(groupDropdownHelper.getSelectedOptionText()).to.equal('group2');
  });

  it('updates field values when series data changes', async function () {
    this.set('series', createSeries(this, {
      name: 'abc',
      type: 'line',
      color: null,
      axis: this.chart.axes[0],
      group: this.chart.seriesGroups[1],
    }));
    await renderComponent();

    this.set('series.name', 'def');
    await settled();

    expect(find('.name-field .form-control')).to.have.value('def');

    this.set('series.type', 'bar');
    await settled();

    expect(typeDropdownHelper.getSelectedOptionText()).to.equal('Bar');

    this.set('series.color', '#ff0000');
    await settled();

    expect(find('.colorType-field .option-custom input'))
      .to.have.property('checked', true);
    expect(find('.customColor-field')).to.exist;
    expect(find('.customColor-field .control-label')).to.contain.text('Custom color:');
    expect(find('.customColor-field input[type="color"]'))
      .to.exist.and.to.have.value('#ff0000');

    this.set('series.axis', this.chart.axes[1]);
    await settled();

    expect(axisDropdownHelper.getSelectedOptionText()).to.equal('axis2');

    this.set('series.group', null);
    await settled();

    expect(groupDropdownHelper.getSelectedOptionText()).to.equal('None');
  });
});

function createSeries(testCase, props = {}) {
  const series = createNewSeries(testCase.owner.lookup('service:i18n'));
  setProperties(series, props);
  return series;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/series-editor-form
    series=series
    chart=chart
    editorContext=editorContext
  }}`);
}
