import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import sinon from 'sinon';
import { drag } from '../../../../helpers/drag-drop';
import {
  createNewSection,
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneTooltipHelper from '../../../../helpers/one-tooltip';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      rootSection: createNewSection(this.owner.lookup('service:i18n'), null, true),
      onRemoveDashboard: sinon.spy(),
    });
  });

  it('has class "sections-editor"', async function () {
    await renderComponent();

    expect(find('.sections-editor')).to.exist;
  });

  it('propagates actions triggered in toolbar', async function () {
    await renderComponent();
    expect(this.onRemoveDashboard).to.be.not.called;

    await click('.remove-dashboard-btn');
    await click('.webui-popover-content .btn-confirm');

    expect(this.onRemoveDashboard).to.be.calledOnce;
  });

  it('shows root section', async function () {
    set(this.rootSection, 'title', 'title1');

    await renderComponent();

    expect(find('.section')).to.exist.and.to.contain.text('title1');
  });

  it('starts with nothing to undo and redo', async function () {
    await renderComponent();

    expect(find('.undo-btn')).to.have.attr('disabled');
    expect(find('.redo-btn')).to.have.attr('disabled');
  });

  it('allows to add nested sections', async function () {
    await renderComponent();
    let structure = getElementsStructure();

    // Add first nested subsection
    await click(structure.addSubsectionTrigger);

    structure = getElementsStructure();
    expect(structure.sections).to.have.length(1);
    expect(structure.sections[0].title).to.equal('Untitled section');
    expect(structure.sections[0].isSelected).to.be.true;

    // Add second nested subsection (after first one)
    await click(structure.addSubsectionTrigger);

    structure = getElementsStructure();
    expect(structure.sections).to.have.length(2);
    expect(structure.sections[1].isSelected).to.be.true;

    // Add first nested subsubsection (inside first one)
    await click(structure.sections[0].addSubsectionTrigger);

    structure = getElementsStructure();
    expect(structure.sections[0].sections).to.have.length(1);
    expect(structure.sections[0].sections[0].isSelected).to.be.true;
  });

  it('allows to undo and redo section creation', async function () {
    await renderComponent();
    let structure = getElementsStructure();

    // Add nested subsection
    await click(structure.addSubsectionTrigger);
    // Add nested subsubsection (inside first one)
    structure = getElementsStructure();
    await click(structure.sections[0].addSubsectionTrigger);
    // Undo subsubsection creation
    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.sections[0].sections).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    // Undo subsection creation
    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.sections).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    // Redo subsection creation
    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.sections[0].sections).to.have.length(0);
    expect(structure.sections[0].isSelected).to.be.true;

    // Redo subsubsection creation
    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.sections[0].sections).to.have.length(1);
    expect(structure.sections[0].sections[0].isSelected).to.be.true;
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

  it('allows to drag&drop section into another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.sections[0].element.id}`, {
        drop: `#${structure.sections[1].element.id} > .inside-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.sections).to.have.length(1);
      expect(structure.sections[0].title).to.equal('2');
      expect(structure.sections[0].sections).to.have.length(1);
      expect(structure.sections[0].sections[0].title).to.equal('1');
      expect(structure.sections[0].sections[0].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections).to.have.length(2);
      expect(structure.sections[0].title).to.equal('1');
      expect(structure.sections[1].title).to.equal('2');
      expect(structure.sections[0].sections).to.have.length(0);
      expect(structure.sections[1].sections).to.have.length(0);
      expect(structure.sections[0].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections).to.have.length(1);
      expect(structure.sections[0].title).to.equal('2');
      expect(structure.sections[0].sections).to.have.length(1);
      expect(structure.sections[0].sections[0].title).to.equal('1');
      expect(structure.sections[0].sections[0].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop section before another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }, {
            title: { content: '3' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.sections[2].element.id}`, {
        drop: `#${structure.sections[1].element.id} > .before-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(structure.sections[1].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(structure.sections[2].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(structure.sections[1].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop section after another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }, {
            title: { content: '3' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.sections[0].element.id}`, {
        drop: `#${structure.sections[1].element.id} > .after-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(structure.sections[1].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(structure.sections[0].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(structure.sections[1].isSelected).to.be.true;
    }
  );

  it('allows to remove section, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
        }, {
          title: { content: '2' },
        }, {
          title: { content: '3' },
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[1].removeTrigger);

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '3']);

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '2', '3']);

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '3']);
  });

  it('allows to duplicate section, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }],
        }, {
          title: { content: '2' },
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[0].duplicateTrigger);

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(structure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(structure.sections[1].isSelected).to.be.true;

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '2']);
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(structure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(structure.sections[1].isSelected).to.be.true;
  });

  it('duplicates section deeply', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }],
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[0].duplicateTrigger);
    // We introduce something differing to one of the duplicates to see
    // if that change will take place only once.
    structure = getElementsStructure();
    await click(structure.sections[0].addSubsectionTrigger);

    structure = getElementsStructure();
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1', 'Untitled section']);
    expect(structure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
  });

  it('allows to add chart, undo it and redo it again', async function () {
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.addChartTrigger);

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['Untitled chart']);
    expect(structure.charts[0].isSelected).to.be.true;

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.charts).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['Untitled chart']);
    expect(structure.charts[0].isSelected).to.be.true;
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

  it('allows to drag&drop chart into another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }],
          charts: [{
            title: { content: 'c1' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.charts[0].element.id}`, {
        drop: `#${structure.sections[0].element.id} > .inside-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.charts).to.have.length(0);
      expect(structure.sections[0].charts).to.have.length(1);
      expect(structure.sections[0].charts[0].title).to.equal('c1');
      expect(structure.sections[0].charts[0].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.charts).to.have.length(1);
      expect(structure.charts[0].title).to.equal('c1');
      expect(structure.sections[0].charts).to.have.length(0);
      expect(structure.charts[0].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.charts).to.have.length(0);
      expect(structure.sections[0].charts).to.have.length(1);
      expect(structure.sections[0].charts[0].title).to.equal('c1');
      expect(structure.sections[0].charts[0].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop chart before another chart, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          charts: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }, {
            title: { content: '3' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.charts[2].element.id}`, {
        drop: `#${structure.charts[1].element.id} > .before-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(structure.charts[1].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(structure.charts[2].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(structure.charts[1].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop chart after another chart, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: { content: 'root' },
          charts: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }, {
            title: { content: '3' },
          }],
        },
      }).rootSection);
      await renderComponent();

      let structure = getElementsStructure();
      await drag(`#${structure.charts[0].element.id}`, {
        drop: `#${structure.charts[1].element.id} > .after-drag-target`,
      });

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(structure.charts[1].isSelected).to.be.true;

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(structure.charts[0].isSelected).to.be.true;

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.charts.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(structure.charts[1].isSelected).to.be.true;
    }
  );

  it('allows to remove chart, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }, {
          title: { content: '2' },
        }, {
          title: { content: '3' },
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.charts[1].removeTrigger);

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '3']);

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '2', '3']);

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '3']);
  });

  it('allows to duplicate chart, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }, {
          title: { content: '2' },
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.charts[0].duplicateTrigger);

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(structure.charts[1].isSelected).to.be.true;

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '2']);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(structure.charts[1].isSelected).to.be.true;
  });

  it('has selected root section by default', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: 'c1' },
        }],
        sections: [{
          title: { content: '1' },
        }],
      },
    }).rootSection);

    await renderComponent();

    const structure = getElementsStructure();
    expect(structure.isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
  });

  it('allows to select section and see its details', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }],
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[0].sections[0].element);

    structure = getElementsStructure();
    expect(structure.sections[0].sections[0].isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
    expect(find('.section-details-editor')).to.exist;
    expect(find('.section-details-editor .title-field .form-control'))
      .to.have.value('1.1');
  });

  it('allows to select chart and see its details', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          charts: [{
            title: { content: '1.1' },
          }],
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[0].charts[0].element);

    structure = getElementsStructure();
    expect(structure.sections[0].charts[0].isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
    expect(find('.chart-details-editor')).to.exist;
    expect(find('.chart-details-editor .title-field .form-control'))
      .to.have.value('1.1');
  });

  it('removes selection from element nested inside removed element', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
            charts: [{
              title: { content: '1.1.1' },
            }],
          }],
        }],
      },
    }).rootSection);
    await renderComponent();
    const structure = getElementsStructure();

    await click(structure.sections[0].sections[0].charts[0].element);
    await click(structure.sections[0].removeTrigger);

    expect(findAll('.selected')).to.have.length(0);
  });

  it('removes selection from element nested inside duplicated element after undo', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
            charts: [{
              title: { content: '1.1.1' },
            }],
          }],
        }],
      },
    }).rootSection);
    await renderComponent();
    let structure = getElementsStructure();

    await click(structure.sections[0].duplicateTrigger);
    structure = getElementsStructure();
    await click(structure.sections[1].sections[0].charts[0].element);
    await click('.undo-btn');

    expect(findAll('.selected')).to.have.length(0);
  });

  it('allows to modify selected section properties, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        sections: [{}],
      },
    }).rootSection);
    await renderComponent();
    const structure = getElementsStructure();
    const sectionElement = structure.sections[0].element;
    await click(sectionElement);

    await fillIn('.title-field .form-control', 'abc');
    expect(sectionElement.querySelector('.section-title')).to.contain.text('abc');

    await fillIn('.titleTip-field .form-control', 'def');
    expect(
      await new OneTooltipHelper(sectionElement.querySelector('.section-title-tip .one-icon'))
      .getText()
    ).to.equal('def');

    await fillIn('.description-field .form-control', 'ghi');
    expect(sectionElement.querySelector('.section-description')).to.contain.text('ghi');

    await click('.undo-btn');
    expect(sectionElement.querySelector('.section-description')).to.not.exist;

    await click('.undo-btn');
    expect(sectionElement.querySelector('.section-title-tip')).to.not.exist;

    await click('.undo-btn');
    expect(sectionElement.querySelector('.section-title')).to.not.exist;

    await click('.redo-btn');
    expect(sectionElement.querySelector('.section-title')).to.contain.text('abc');

    await click('.redo-btn');
    expect(
      await new OneTooltipHelper(sectionElement.querySelector('.section-title-tip .one-icon'))
      .getText()
    ).to.equal('def');

    await click('.redo-btn');
    expect(sectionElement.querySelector('.section-description')).to.contain.text('ghi');
  });

  it('allows to modify selected chart properties, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        charts: [{}],
      },
    }).rootSection);
    await renderComponent();
    const structure = getElementsStructure();
    const chartElement = structure.charts[0].element;
    await click(chartElement);

    await fillIn('.title-field .form-control', 'abc');
    expect(chartElement.querySelector('.title-content')).to.contain.text('abc');

    await fillIn('.titleTip-field .form-control', 'def');
    expect(
      await new OneTooltipHelper(chartElement.querySelector('.title-tip .one-icon'))
      .getText()
    ).to.equal('def');

    await click('.undo-btn');
    expect(chartElement.querySelector('.title-tip')).to.not.exist;

    await click('.undo-btn');
    expect(chartElement.querySelector('.title-content')).to.not.exist;

    await click('.redo-btn');
    expect(chartElement.querySelector('.title-content')).to.contain.text('abc');

    await click('.redo-btn');
    expect(
      await new OneTooltipHelper(chartElement.querySelector('.title-tip .one-icon'))
      .getText()
    ).to.equal('def');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor
    rootSection=rootSection
    onRemoveDashboard=onRemoveDashboard
  }}`);
}

function getElementsStructure(sectionElement) {
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
