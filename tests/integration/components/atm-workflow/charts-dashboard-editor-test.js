import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, settled, findAll, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { getElementsStructure } from './charts-dashboard-editor/sections-editor-test';
import { drag } from '../../../helpers/drag-drop';
import OneTooltipHelper from '../../../helpers/one-tooltip';

const emptyDashboard = { rootSection: {} };

describe('Integration | Component | atm-workflow/charts-dashboard-editor (main)', function () {
  setupRenderingTest();

  it('has class "charts-dashboard-editor"', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(find('.charts-dashboard-editor')).to.exist;
  });

  it('shows "no dashboard" info and no sections editor when dashboard spec is not provided', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.noDashboardInfo).to.exist;
    expect(helper.sectionsEditor).to.not.exist;
  });

  it('does not show "no dashboard" info and shows sections editor when dashboard spec is provided',
    async function () {
      const helper = new Helper(this, {
        rootSection: {
          title: { content: 'title1' },
        },
      });

      await helper.render();

      expect(helper.noDashboardInfo).to.not.exist;
      expect(helper.sectionsEditor).to.exist;
      expect(helper.sectionsEditor.querySelector('.section'))
        .to.contain.text('title1');
    }
  );

  it('does not show "no dashboard" info and shows sections editor when dashboard spec was not provided and user created one',
    async function () {
      const helper = new Helper(this);
      await helper.render();

      await click(helper.createDashboardBtn);

      expect(helper.noDashboardInfo).to.not.exist;
      expect(helper.sectionsEditor).to.exist;
      expect(helper.sectionsEditor.querySelector('.section'))
        .to.contain.text('Untitled section');
    }
  );

  it('shows "no dashboard" info and no sections editor when user created dashboard and then another nullish dashboard spec was provided',
    async function () {
      const helper = new Helper(this);
      await helper.render();

      await click(helper.createDashboardBtn);
      helper.dashboardSpec = {};
      await settled();

      expect(helper.noDashboardInfo).to.exist;
      expect(helper.sectionsEditor).to.not.exist;
    }
  );

  it('allows to remove dashboard', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    await click('.remove-dashboard-btn');
    await click('.webui-popover-content .btn-confirm');

    expect(helper.noDashboardInfo).to.exist;
    expect(helper.sectionsEditor).to.not.exist;
  });

  it('starts with nothing to undo and redo', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    expect(find('.undo-btn')).to.have.attr('disabled');
    expect(find('.redo-btn')).to.have.attr('disabled');
  });

  it('allows to add nested sections', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    // Add first nested subsection
    await click(helper.sectionsEditorStructure.addSubsectionTrigger);

    expect(helper.sectionsEditorStructure.sections).to.have.length(1);
    expect(helper.sectionsEditorStructure.sections[0].title).to.equal('Untitled section');
    expect(helper.sectionsEditorStructure.sections[0].isSelected).to.be.true;

    // Add second nested subsection (after first one)
    await click(helper.sectionsEditorStructure.addSubsectionTrigger);

    expect(helper.sectionsEditorStructure.sections).to.have.length(2);
    expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;

    // Add first nested subsubsection (inside first one)
    await click(helper.sectionsEditorStructure.sections[0].addSubsectionTrigger);

    expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(1);
    expect(helper.sectionsEditorStructure.sections[0].sections[0].isSelected).to.be.true;
  });

  it('allows to undo and redo section creation', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    // Add nested subsection
    await click(helper.sectionsEditorStructure.addSubsectionTrigger);
    // Add nested subsubsection (inside first one)
    await click(helper.sectionsEditorStructure.sections[0].addSubsectionTrigger);
    // Undo subsubsection creation
    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    // Undo subsection creation
    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.sections).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    // Redo subsection creation
    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(0);
    expect(helper.sectionsEditorStructure.sections[0].isSelected).to.be.true;

    // Redo subsubsection creation
    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(1);
    expect(helper.sectionsEditorStructure.sections[0].sections[0].isSelected).to.be.true;
  });

  it('allows to drag&drop section into another section, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }, {
            title: { content: '2' },
          }],
        },
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.sections[0].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.sections[1].element.id} > .inside-drag-target`,
      });

      expect(helper.sectionsEditorStructure.sections).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].title).to.equal('2');
      expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].sections[0].title).to.equal('1');
      expect(helper.sectionsEditorStructure.sections[0].sections[0].isSelected)
        .to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.sections).to.have.length(2);
      expect(helper.sectionsEditorStructure.sections[0].title).to.equal('1');
      expect(helper.sectionsEditorStructure.sections[1].title).to.equal('2');
      expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(0);
      expect(helper.sectionsEditorStructure.sections[1].sections).to.have.length(0);
      expect(helper.sectionsEditorStructure.sections[0].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.sections).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].title).to.equal('2');
      expect(helper.sectionsEditorStructure.sections[0].sections).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].sections[0].title).to.equal('1');
      expect(helper.sectionsEditorStructure.sections[0].sections[0].isSelected)
        .to.be.true;
    }
  );

  it('allows to drag&drop section before another section, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
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
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.sections[2].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.sections[1].element.id} > .before-drag-target`,
      });

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(helper.sectionsEditorStructure.sections[2].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop section after another section, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
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
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.sections[0].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.sections[1].element.id} > .after-drag-target`,
      });

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(helper.sectionsEditorStructure.sections[0].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;
    }
  );

  it('allows to remove section, undo it and redo it again', async function () {
    const helper = new Helper(this, {
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
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[1].removeTrigger);

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '3']);

    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '2', '3']);

    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '3']);
  });

  it('allows to duplicate section, undo it and redo it again', async function () {
    const helper = new Helper(this, {
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
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].duplicateTrigger);

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(helper.sectionsEditorStructure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(helper.sectionsEditorStructure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;

    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '2']);
    expect(helper.sectionsEditorStructure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.sections.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(helper.sectionsEditorStructure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(helper.sectionsEditorStructure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
    expect(helper.sectionsEditorStructure.sections[1].isSelected).to.be.true;
  });

  it('duplicates section deeply', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }],
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].duplicateTrigger);
    // We introduce something differing to one of the duplicates to see
    // if that change will take place only once.
    await click(helper.sectionsEditorStructure.sections[0].addSubsectionTrigger);

    expect(helper.sectionsEditorStructure.sections[0].sections.map(({ title }) => title))
      .to.deep.equal(['1.1', 'Untitled section']);
    expect(helper.sectionsEditorStructure.sections[1].sections.map(({ title }) => title))
      .to.deep.equal(['1.1']);
  });

  it('allows to add chart, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    await click(helper.sectionsEditorStructure.addChartTrigger);

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['Untitled chart']);
    expect(helper.sectionsEditorStructure.charts[0].isSelected).to.be.true;

    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.charts).to.have.length(0);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['Untitled chart']);
    expect(helper.sectionsEditorStructure.charts[0].isSelected).to.be.true;
  });

  it('allows to drag&drop chart into another section, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
        rootSection: {
          title: { content: 'root' },
          sections: [{
            title: { content: '1' },
          }],
          charts: [{
            title: { content: 'c1' },
          }],
        },
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.charts[0].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.sections[0].element.id} > .inside-drag-target`,
      });

      expect(helper.sectionsEditorStructure.charts).to.have.length(0);
      expect(helper.sectionsEditorStructure.sections[0].charts).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].charts[0].title).to.equal('c1');
      expect(helper.sectionsEditorStructure.sections[0].charts[0].isSelected).to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.charts).to.have.length(1);
      expect(helper.sectionsEditorStructure.charts[0].title).to.equal('c1');
      expect(helper.sectionsEditorStructure.sections[0].charts).to.have.length(0);
      expect(helper.sectionsEditorStructure.charts[0].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.charts).to.have.length(0);
      expect(helper.sectionsEditorStructure.sections[0].charts).to.have.length(1);
      expect(helper.sectionsEditorStructure.sections[0].charts[0].title).to.equal('c1');
      expect(helper.sectionsEditorStructure.sections[0].charts[0].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop chart before another chart, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
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
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.charts[2].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.charts[1].element.id} > .before-drag-target`,
      });

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(helper.sectionsEditorStructure.charts[2].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '3', '2']);
      expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;
    }
  );

  it('allows to drag&drop chart after another chart, undo it and redo it again',
    async function () {
      const helper = new Helper(this, {
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
      });
      await helper.render();

      await drag(`#${helper.sectionsEditorStructure.charts[0].element.id}`, {
        drop: `#${helper.sectionsEditorStructure.charts[1].element.id} > .after-drag-target`,
      });

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;

      await click('.undo-btn');

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['1', '2', '3']);
      expect(helper.sectionsEditorStructure.charts[0].isSelected).to.be.true;

      await click('.redo-btn');

      expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
        .to.deep.equal(['2', '1', '3']);
      expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;
    }
  );

  it('allows to remove chart, undo it and redo it again', async function () {
    const helper = new Helper(this, {
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
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.charts[1].removeTrigger);

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '3']);

    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '2', '3']);

    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '3']);
  });

  it('allows to duplicate chart, undo it and redo it again', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }, {
          title: { content: '2' },
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.charts[0].duplicateTrigger);

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;

    await click('.undo-btn');

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '2']);
    expect(find('.selected')).to.not.exist;

    await click('.redo-btn');

    expect(helper.sectionsEditorStructure.charts.map(({ title }) => title))
      .to.deep.equal(['1', '1', '2']);
    expect(helper.sectionsEditorStructure.charts[1].isSelected).to.be.true;
  });

  it('has selected root section by default', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: 'c1' },
        }],
        sections: [{
          title: { content: '1' },
        }],
      },
    });
    await helper.render();

    expect(helper.sectionsEditorStructure.isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
  });

  it('allows to select section and see its details', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          sections: [{
            title: { content: '1.1' },
          }],
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].sections[0].element);

    expect(helper.sectionsEditorStructure.sections[0].sections[0].isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
    expect(find('.section-details-editor')).to.exist;
    expect(find('.section-details-editor .title-field .form-control'))
      .to.have.value('1.1');
  });

  it('allows to select chart and see its details', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        sections: [{
          title: { content: '1' },
          charts: [{
            title: { content: '1.1' },
          }],
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].charts[0].element);

    expect(helper.sectionsEditorStructure.sections[0].charts[0].isSelected).to.be.true;
    expect(findAll('.selected')).to.have.length(1);
    expect(find('.chart-details-editor')).to.exist;
    expect(find('.chart-details-editor .title-field .form-control'))
      .to.have.value('1.1');
  });

  it('removes selection from element nested inside removed element', async function () {
    const helper = new Helper(this, {
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
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].sections[0].charts[0].element);
    await click(helper.sectionsEditorStructure.sections[0].removeTrigger);

    expect(findAll('.selected')).to.have.length(0);
  });

  it('removes selection from element nested inside duplicated element after undo', async function () {
    const helper = new Helper(this, {
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
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.sections[0].duplicateTrigger);
    await click(helper.sectionsEditorStructure.sections[1].sections[0].charts[0].element);
    await click('.undo-btn');

    expect(findAll('.selected')).to.have.length(0);
  });

  it('allows to modify selected section properties, undo it and redo it again', async function () {
    const helper = new Helper(this, {
      rootSection: {
        sections: [{}],
      },
    });
    await helper.render();
    const sectionElement = helper.sectionsEditorStructure.sections[0].element;
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
    const helper = new Helper(this, {
      rootSection: {
        charts: [{}],
      },
    });
    await helper.render();

    const chartElement = helper.sectionsEditorStructure.charts[0].element;
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

class Helper {
  get noDashboardInfo() {
    return find('.no-dashboard-info');
  }

  get createDashboardBtn() {
    return this.noDashboardInfo?.querySelector('.create-btn');
  }

  get sectionsEditor() {
    return find('.sections-editor');
  }

  get dashboardSpec() {
    return this.testContext.get('dashboardSpec');
  }

  set dashboardSpec(value) {
    this.testContext.set('dashboardSpec', value);
  }

  get sectionsEditorStructure() {
    return getElementsStructure();
  }

  constructor(testContext, dashboardSpec = {}) {
    this.testContext = testContext;
    this.dashboardSpec = dashboardSpec;
  }

  async render() {
    await render(hbs`{{atm-workflow/charts-dashboard-editor
      dashboardSpec=dashboardSpec
    }}`);
  }
}
