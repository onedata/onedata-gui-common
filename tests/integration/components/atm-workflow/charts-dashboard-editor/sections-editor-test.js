import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import sinon from 'sinon';
import { drag } from '../../../../helpers/drag-drop';
import {
  createNewSection,
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      rootSection: createNewSection(this.owner.lookup('service:i18n'), true),
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

    // Add first nested subsection
    await click('.root-section > .add-subsection');

    const sections = findAll('.section');
    expect(sections).to.have.length(2);
    expect(sections[1]).to.contain.text('Untitled section');

    // Add second nested subsection (after first one)
    await click('.root-section > .add-subsection');

    expect(findAll('.section')).to.have.length(3);

    // Add first nested subsubsection (inside first one)
    await click('.add-subsection');

    expect(findAll('.section')).to.have.length(4);
    expect(findAll('.section .section .section')).to.have.length(1);
  });

  it('allows to undo and redo section creation', async function () {
    await renderComponent();

    // Add nested subsection
    await click('.add-subsection');
    // Add nested subsubsection (inside first one)
    await click('.add-subsection');
    // Undo subsubsection creation
    await click('.undo-btn');

    expect(findAll('.section')).to.have.length(2);

    // Undo subsection creation
    await click('.undo-btn');

    expect(findAll('.section')).to.have.length(1);

    // Redo subsection creation
    await click('.redo-btn');

    expect(findAll('.section')).to.have.length(2);

    // Redo subsubsection creation
    await click('.redo-btn');

    expect(findAll('.section')).to.have.length(3);
  });

  it('does not render any drop places when nothing is dragged', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: 'root',
        sections: [{
          title: '1',
        }],
      },
    }).rootSection);

    await renderComponent();

    expect(find('.draggable-object-target')).to.not.exist;
  });

  it('renders all possible drop places when section is dragged', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: 'root',
        sections: [{
          title: '1',
          sections: [{
            title: '1.1',
          }, {
            title: '1.2',
          }],
        }, {
          title: '2',
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
          title: 'root',
          sections: [{
            title: '1',
          }, {
            title: '2',
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

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections).to.have.length(2);
      expect(structure.sections[0].title).to.equal('1');
      expect(structure.sections[1].title).to.equal('2');
      expect(structure.sections[0].sections).to.have.length(0);
      expect(structure.sections[1].sections).to.have.length(0);

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections).to.have.length(1);
      expect(structure.sections[0].title).to.equal('2');
      expect(structure.sections[0].sections).to.have.length(1);
      expect(structure.sections[0].sections[0].title).to.equal('1');
    }
  );

  it('allows to drag&drop section before another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: 'root',
          sections: [{
            title: '1',
          }, {
            title: '2',
          }, {
            title: '3',
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

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
    }
  );

  it('allows to drag&drop section after another section, undo it and redo it again',
    async function () {
      this.set('rootSection', createModelFromSpec({
        rootSection: {
          title: 'root',
          sections: [{
            title: '1',
          }, {
            title: '2',
          }, {
            title: '3',
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

      await click('.undo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);

      await click('.redo-btn');

      structure = getElementsStructure();
      expect(structure.sections.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
    }
  );

  it('allows to remove section, undo it and redo it again', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: 'root',
        sections: [{
          title: '1',
        }, {
          title: '2',
        }, {
          title: '3',
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
        title: 'root',
        sections: [{
          title: '1',
          sections: [{
            title: '1.1',
          }],
        }, {
          title: '2',
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

    await click('.undo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '2']);
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);

    await click('.redo-btn');

    structure = getElementsStructure();
    expect(structure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(structure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(structure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
  });

  it('duplicates section deeply', async function () {
    this.set('rootSection', createModelFromSpec({
      rootSection: {
        title: 'root',
        sections: [{
          title: '1',
          sections: [{
            title: '1.1',
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
    title: sectionElement.querySelector(':scope > .section-header > .section-title')
      ?.textContent.trim() ?? null,
    insideDragTarget: sectionElement.querySelector(':scope > .inside-drag-target'),
    beforeDragTarget: sectionElement.querySelector(':scope > .before-drag-target'),
    afterDragTarget: sectionElement.querySelector(':scope > .after-drag-target'),
    duplicateTrigger: sectionElement.querySelector(':scope > .floating-toolbar .duplicate-action'),
    removeTrigger: sectionElement.querySelector(':scope > .floating-toolbar .remove-action'),
    addSubsectionTrigger: sectionElement.querySelector(':scope > .add-subsection'),
    sections: [
      ...sectionElement.querySelectorAll(':scope > .section-subsections > .section'),
    ].map((subsectionElement) => getElementsStructure(subsectionElement)),
  };
}
