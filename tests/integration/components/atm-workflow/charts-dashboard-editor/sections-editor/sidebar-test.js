import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  createNewSection,
  createNewChart,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/sidebar', function () {
  setupRenderingTest();

  it('has class "sidebar"', async function () {
    await renderComponent();

    expect(find('.sidebar')).to.exist;
  });

  it('shows section details editor when "selectedElement" is a section', async function () {
    this.set('selectedElement', createNewSection(this.owner.lookup('service:i18n')));
    this.set('selectedElement.title', 'abc');
    await renderComponent();

    expect(find('.section-details-editor')).to.exist;
    expect(find('.title-field .form-control')).to.have.value('abc');
  });

  it('shows chart details editor when "selectedElement" is a chart', async function () {
    this.set('selectedElement', createNewChart(this.owner.lookup('service:i18n')));
    this.set('selectedElement.title', 'abc');
    await renderComponent();

    expect(find('.chart-details-editor')).to.exist;
    expect(find('.title-field .form-control')).to.have.value('abc');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/sidebar
    selectedElement=selectedElement
  }}`);
}
