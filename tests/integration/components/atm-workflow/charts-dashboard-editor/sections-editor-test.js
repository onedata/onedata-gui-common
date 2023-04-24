import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import { drag } from '../../../../helpers/drag-drop';
import {
  createNewSection,
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set(
      'rootSection',
      createNewSection(this.owner.lookup('service:i18n'), null, true),
    );
  });

  it('has class "sections-editor"', async function () {
    await renderComponent();

    expect(find('.sections-editor')).to.exist;
  });

  it('shows root section', async function () {
    set(this.rootSection, 'title', 'title1');

    await renderComponent();

    expect(find('.section')).to.exist.and.to.contain.text('title1');
  });

  it('does not render any drop places when nothing is dragged', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
        }],
      },
    }).rootSection);

    await renderComponent();

    expect(find('.draggable-object-target')).to.not.exist;
  });

  it('renders all possible drop places when section is dragged', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }, {
            title: { content: '1.2' },
          }],
        }, {
          title: { content: '2' },
        }],
      },
    }).rootSection);
    await renderComponent();

    let structure = getElementsStructure();
    await drag(`#${structure.sections[0].sections[0].element.id}`);

    structure = getElementsStructure();
    expect(structure.insideDragTarget).to.exist;
    expect(structure.beforeDragTarget).to.not.exist;
    expect(structure.afterDragTarget).to.not.exist;
    [
      structure.sections[0],
      structure.sections[0].sections[1],
      structure.sections[1],
    ].forEach((sectionElement) => {
      expect(sectionElement.insideDragTarget).to.exist;
      expect(sectionElement.beforeDragTarget).to.exist;
      expect(sectionElement.afterDragTarget).to.exist;
    });
    const draggedSection = structure.sections[0].sections[0];
    expect(draggedSection.insideDragTarget).to.not.exist;
    expect(draggedSection.beforeDragTarget).to.not.exist;
    expect(draggedSection.afterDragTarget).to.not.exist;
  });

  it('renders all possible drop places when chart is dragged', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          charts: [{
            title: { content: 'c1.1' },
          }, {
            title: { content: 'c1.2' },
          }],
          sections: [{
            title: { content: '1.1' },
          }],
        }, {
          title: { content: '2' },
          charts: [{
            title: { content: 'c2.1' },
          }],
        }],
      },
    }).rootSection);
    await renderComponent();

    let structure = getElementsStructure();
    await drag(`#${structure.sections[0].charts[0].element.id}`);

    structure = getElementsStructure();
    expect(structure.insideDragTarget).to.exist;
    expect(structure.beforeDragTarget).to.not.exist;
    expect(structure.afterDragTarget).to.not.exist;
    [
      structure,
      structure.sections[0],
      structure.sections[0].sections[0],
      structure.sections[1],
    ].forEach((sectionElement) => {
      expect(sectionElement.insideDragTarget).to.exist;
      expect(sectionElement.beforeDragTarget).to.not.exist;
      expect(sectionElement.afterDragTarget).to.not.exist;
    });
    [
      structure.sections[0].charts[1],
      structure.sections[1].charts[0],
    ].forEach((sectionElement) => {
      expect(sectionElement.insideDragTarget).to.not.exist;
      expect(sectionElement.beforeDragTarget).to.exist;
      expect(sectionElement.afterDragTarget).to.exist;
    });
    const draggedChart = structure.sections[0].charts[0];
    expect(draggedChart.insideDragTarget).to.not.exist;
    expect(draggedChart.beforeDragTarget).to.not.exist;
    expect(draggedChart.afterDragTarget).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor
    rootSection=rootSection
  }}`);
}

export function getElementsStructure(sectionElement) {
  if (!sectionElement) {
    const root = find('.root-section');
    if (!root) {
      return {
        element: null,
      };
    }
    return getElementsStructure(root);
  }

  return {
    element: sectionElement,
    title: sectionElement.querySelector(
      ':scope > .section-header > .section-title, :scope > .title-area .title-content'
    )?.textContent.trim() ?? null,
    isSelected: sectionElement.matches('.selected'),
    insideDragTarget: sectionElement.querySelector(':scope > .inside-drag-target'),
    beforeDragTarget: sectionElement.querySelector(':scope > .before-drag-target'),
    afterDragTarget: sectionElement.querySelector(':scope > .after-drag-target'),
    duplicateTrigger: sectionElement.querySelector(':scope > .floating-toolbar .duplicate-action'),
    removeTrigger: sectionElement.querySelector(':scope > .floating-toolbar .remove-action'),
    addChartTrigger: sectionElement.querySelector(':scope > .add-chart'),
    addSubsectionTrigger: sectionElement.querySelector(':scope > .add-subsection'),
    sections: [
      ...sectionElement.querySelectorAll(':scope > .section-subsections > .section'),
    ].map((subsectionElement) => getElementsStructure(subsectionElement)),
    charts: [
      ...sectionElement.querySelectorAll(':scope > .section-charts > .chart'),
    ].map((chartElement) => getElementsStructure(chartElement)),
  };
}
