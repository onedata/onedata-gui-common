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

  it('allows to edit charts content via "edit content" in chart element', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    expect(find('.chart-editor')).to.exist;
    expect(find('.view-title')).to.have.text('Chart "1" editor');
  });

  it('allows to edit charts content via "edit content" in sidebar', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }],
      },
    });
    await helper.render();

    await click(helper.sectionsEditorStructure.charts[0].element);
    await click(find('.chart-details-editor .edit-content'));

    expect(find('.chart-editor')).to.exist;
    expect(find('.view-title')).to.have.text('Chart "1" editor');
  });

  it('allows to close chart content editor via "back" button', async function () {
    const helper = new Helper(this, {
      rootSection: {
        title: { content: 'root' },
        charts: [{
          title: { content: '1' },
        }],
      },
    });
    await helper.render();
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    await click('.back-btn');

    expect(find('.chart-editor')).to.not.exist;
    expect(find('.view-title')).to.have.text('Dashboard overview');
    expect(helper.sectionsEditorStructure.charts[0].isSelected).to.be.true;
  });

  it('fills new chart with preconfigured elements', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();

    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(0);
    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(0);
    const axes = helper.chartEditorStructure.elements.axes.items;
    expect(axes).to.have.length(1);
    expect(axes[0].name).to.equal('Value');
    expect(axes[0].unitName).to.equal('None');
  });

  it('allows to create new chart series, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    await click(helper.chartEditorStructure.elements.series.addTrigger);

    const series = helper.chartEditorStructure.elements.series.items;
    expect(series).to.have.length(1);
    expect(series[0].name).to.equal('Series');
    expect(series[0].type).to.equal('Line');
    expect(series[0].axisName).to.equal('Value');

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(0);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(1);
  });

  it('allows to move chart series to the end, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    const seriesIds =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.series.items[0].element.id}`, {
      drop: getDropTargetSelector(seriesIds[2], 'after'),
    });

    const newSeriesIds =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);
    expect(newSeriesIds).to.deep.equal([seriesIds[1], seriesIds[2], seriesIds[0]]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id)
    ).to.deep.equal(seriesIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id)
    ).to.deep.equal(newSeriesIds);
  });

  it('allows to move chart series to the beginning, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    const seriesIds =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.series.items[2].element.id}`, {
      drop: getDropTargetSelector(seriesIds[0], 'before'),
    });

    const newSeriesIds =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);
    expect(newSeriesIds).to.deep.equal([seriesIds[2], seriesIds[0], seriesIds[1]]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id)
    ).to.deep.equal(seriesIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id)
    ).to.deep.equal(newSeriesIds);
  });

  it('allows to duplicate chart series, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    const seriesId = helper.chartEditorStructure.elements.series.items[0].id;

    await click(helper.chartEditorStructure.elements.series.items[0].duplicateTrigger);

    const newSeries = helper.chartEditorStructure.elements.series.items;
    expect(newSeries).to.have.length(2);
    expect(newSeries[0].id).to.equal(seriesId);
    expect(newSeries[1].id).to.not.equal(seriesId);
    expect(newSeries[1].name).to.equal(newSeries[0].name);
    expect(newSeries[1].type).to.equal(newSeries[0].type);
    expect(newSeries[1].axisName).to.equal(newSeries[0].axisName);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(1);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(2);
  });

  it('allows to remove chart series, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    await click(helper.chartEditorStructure.elements.series.addTrigger);
    const seriesIds =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);

    await click(helper.chartEditorStructure.elements.series.items[1].removeTrigger);

    const newSeriesId =
      helper.chartEditorStructure.elements.series.items.map(({ id }) => id);
    expect(newSeriesId).to.deep.equal([seriesIds[0]]);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(2);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.series.items).to.have.length(1);
  });

  it('allows to create new chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);

    const seriesGroups = helper.chartEditorStructure.elements.seriesGroups.items;
    expect(seriesGroups).to.have.length(1);
    expect(seriesGroups[0].name).to.equal('Group');
    expect(seriesGroups[0].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(0);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(1);
  });

  it('allows to create new nested chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);

    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);

    const seriesSubgroups =
      helper.chartEditorStructure.elements.seriesGroups.items[0].items;
    expect(seriesSubgroups).to.have.length(1);
    expect(seriesSubgroups[0].name).to.equal('Group');
    expect(seriesSubgroups[0].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(0);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(1);
  });

  it('allows to move chart series group to the end, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    const seriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.seriesGroups.items[0].element.id}`, {
      drop: getDropTargetSelector(seriesGroupsIds[2], 'after'),
    });

    const newSeriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
    expect(newSeriesGroupsIds).to.deep.equal([
      seriesGroupsIds[1],
      seriesGroupsIds[2],
      seriesGroupsIds[0],
    ]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(seriesGroupsIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(newSeriesGroupsIds);
  });

  it('allows to move chart series group to the beginning, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    const seriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.seriesGroups.items[2].element.id}`, {
      drop: getDropTargetSelector(seriesGroupsIds[0], 'before'),
    });

    const newSeriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
    expect(newSeriesGroupsIds).to.deep.equal([
      seriesGroupsIds[2],
      seriesGroupsIds[0],
      seriesGroupsIds[1],
    ]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(seriesGroupsIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(newSeriesGroupsIds);
  });

  it('allows to move chart series group into another group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    const seriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
    const nestedSeriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items[0]
      .items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.seriesGroups.items[1].element.id}`, {
      drop: getDropTargetSelector(seriesGroupsIds[0], 'inside'),
    });

    const newSeriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
    const newNestedSeriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items[0]
      .items.map(({ id }) => id);
    expect(newSeriesGroupsIds).to.deep.equal([seriesGroupsIds[0]]);
    expect(newNestedSeriesGroupsIds).to.deep.equal([
      nestedSeriesGroupsIds[0],
      seriesGroupsIds[1],
    ]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(seriesGroupsIds);
    expect(
      helper.chartEditorStructure.elements.seriesGroups.items[0].items.map(({ id }) => id)
    ).to.deep.equal(nestedSeriesGroupsIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
    ).to.deep.equal(newSeriesGroupsIds);
    expect(
      helper.chartEditorStructure.elements.seriesGroups.items[0].items.map(({ id }) => id)
    ).to.deep.equal(newNestedSeriesGroupsIds);
  });

  it('allows to move chart series group from nesting back to the root level, undo it and redo it again',
    async function () {
      const helper = new Helper(this, emptyDashboard);
      await helper.render();
      await click(helper.sectionsEditorStructure.addChartTrigger);
      await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
      await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
      await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
      await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
      const seriesGroupsIds =
        helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
      const nestedSeriesGroupsIds =
        helper.chartEditorStructure.elements.seriesGroups.items[0]
        .items.map(({ id }) => id);

      await drag(`#${helper.chartEditorStructure.elements.seriesGroups.items[0].items[0].element.id}`, {
        drop: getDropTargetSelector(seriesGroupsIds[0], 'after'),
      });

      const newSeriesGroupsIds =
        helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
      const newNestedSeriesGroupsIds =
        helper.chartEditorStructure.elements.seriesGroups.items[0]
        .items.map(({ id }) => id);
      expect(newSeriesGroupsIds).to.deep.equal([
        seriesGroupsIds[0],
        nestedSeriesGroupsIds[0],
      ]);
      expect(newNestedSeriesGroupsIds).to.deep.equal([nestedSeriesGroupsIds[1]]);

      await click('.undo-btn');

      expect(
        helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
      ).to.deep.equal(seriesGroupsIds);
      expect(
        helper.chartEditorStructure.elements.seriesGroups
        .items[0].items.map(({ id }) => id)
      ).to.deep.equal(nestedSeriesGroupsIds);

      await click('.redo-btn');

      expect(
        helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id)
      ).to.deep.equal(newSeriesGroupsIds);
      expect(
        helper.chartEditorStructure.elements.seriesGroups
        .items[0].items.map(({ id }) => id)
      ).to.deep.equal(newNestedSeriesGroupsIds);
    }
  );

  it('allows to duplicate chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    const seriesGroupId = helper.chartEditorStructure.elements.seriesGroups.items[0].id;
    const nestedSeriesGroupId = helper.chartEditorStructure.elements.seriesGroups
      .items[0].items[0].id;

    await click(
      helper.chartEditorStructure.elements.seriesGroups.items[0].duplicateTrigger
    );

    const newSeriesGroups = helper.chartEditorStructure.elements.seriesGroups.items;
    expect(newSeriesGroups).to.have.length(2);
    expect(newSeriesGroups[0].id).to.equal(seriesGroupId);
    expect(newSeriesGroups[1].id).to.not.equal(seriesGroupId);
    expect(newSeriesGroups[1].name).to.equal(newSeriesGroups[0].name);
    expect(newSeriesGroups[1].seriesCount).to.equal(0);
    expect(newSeriesGroups[0].items).to.have.length(1);
    expect(newSeriesGroups[1].items).to.have.length(1);
    expect(newSeriesGroups[0].items[0].id).to.equal(nestedSeriesGroupId);
    expect(newSeriesGroups[1].items[0].id).to.not.equal(nestedSeriesGroupId);
    expect(newSeriesGroups[1].items[0].name).to.equal(newSeriesGroups[0].items[0].name);
    expect(newSeriesGroups[1].items[0].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(1);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(2);
  });

  it('allows to duplicate nested chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    const seriesGroupId = helper.chartEditorStructure.elements.seriesGroups.items[0].id;
    const nestedSeriesGroupId = helper.chartEditorStructure.elements.seriesGroups
      .items[0].items[0].id;

    await click(
      helper.chartEditorStructure.elements.seriesGroups.items[0].items[0].duplicateTrigger
    );

    const newSeriesGroups = helper.chartEditorStructure.elements.seriesGroups.items;
    expect(newSeriesGroups).to.have.length(1);
    expect(newSeriesGroups[0].id).to.equal(seriesGroupId);
    expect(newSeriesGroups[0].items).to.have.length(2);
    expect(newSeriesGroups[0].items[0].id).to.equal(nestedSeriesGroupId);
    expect(newSeriesGroups[0].items[1].id).to.not.equal(nestedSeriesGroupId);
    expect(newSeriesGroups[0].items[1].name).to.equal(newSeriesGroups[0].items[0].name);
    expect(newSeriesGroups[0].items[1].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(1);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(2);
  });

  it('allows to remove chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    const seriesGroupsIds =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);

    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].removeTrigger);

    const newSeriesGroupsId =
      helper.chartEditorStructure.elements.seriesGroups.items.map(({ id }) => id);
    expect(newSeriesGroupsId).to.deep.equal([seriesGroupsIds[1]]);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(2);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items).to.have.length(1);
  });

  it('allows to remove nested chart series group, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    await click(helper.chartEditorStructure.elements.seriesGroups.items[0].addTrigger);
    const nestedSeriesGroupIds =
      helper.chartEditorStructure.elements.seriesGroups
      .items[0].items.map(({ id }) => id);

    await click(
      helper.chartEditorStructure.elements.seriesGroups.items[0].items[0].removeTrigger
    );

    const newNestedSeriesGroupsId =
      helper.chartEditorStructure.elements.seriesGroups
      .items[0].items.map(({ id }) => id);
    expect(newNestedSeriesGroupsId).to.deep.equal([nestedSeriesGroupIds[1]]);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(2);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.seriesGroups.items[0].items)
      .to.have.length(1);
  });

  it('allows to create new chart axis, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);

    await click(helper.chartEditorStructure.elements.axes.addTrigger);

    const axes = helper.chartEditorStructure.elements.axes.items;
    expect(axes).to.have.length(2);
    expect(axes[1].name).to.equal('Value');
    expect(axes[1].unitName).to.equal('None');
    expect(axes[1].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(1);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(2);
  });

  it('allows to move chart axis to the end, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.axes.addTrigger);
    await click(helper.chartEditorStructure.elements.axes.addTrigger);
    const axesIds =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.axes.items[0].element.id}`, {
      drop: getDropTargetSelector(axesIds[2], 'after'),
    });

    const newAxesIds =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);
    expect(newAxesIds).to.deep.equal([axesIds[1], axesIds[2], axesIds[0]]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id)
    ).to.deep.equal(axesIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id)
    ).to.deep.equal(newAxesIds);
  });

  it('allows to move chart axis to the beginning, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.axes.addTrigger);
    await click(helper.chartEditorStructure.elements.axes.addTrigger);
    const axesIds =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);

    await drag(`#${helper.chartEditorStructure.elements.axes.items[2].element.id}`, {
      drop: getDropTargetSelector(axesIds[0], 'before'),
    });

    const newAxesIds =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);
    expect(newAxesIds).to.deep.equal([axesIds[2], axesIds[0], axesIds[1]]);

    await click('.undo-btn');

    expect(
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id)
    ).to.deep.equal(axesIds);

    await click('.redo-btn');

    expect(
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id)
    ).to.deep.equal(newAxesIds);
  });

  it('allows to duplicate chart axis, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    const axisId = helper.chartEditorStructure.elements.axes.items[0].id;

    await click(helper.chartEditorStructure.elements.axes.items[0].duplicateTrigger);

    const newAxes = helper.chartEditorStructure.elements.axes.items;
    expect(newAxes).to.have.length(2);
    expect(newAxes[0].id).to.equal(axisId);
    expect(newAxes[1].id).to.not.equal(axisId);
    expect(newAxes[1].name).to.equal(newAxes[0].name);
    expect(newAxes[1].unitName).to.equal(newAxes[0].unitName);
    expect(newAxes[1].seriesCount).to.equal(0);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(1);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(2);
  });

  it('allows to remove chart axis, undo it and redo it again', async function () {
    const helper = new Helper(this, emptyDashboard);
    await helper.render();
    await click(helper.sectionsEditorStructure.addChartTrigger);
    await click(helper.sectionsEditorStructure.charts[0].editContentTrigger);
    await click(helper.chartEditorStructure.elements.axes.addTrigger);
    const axesIds =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);

    await click(helper.chartEditorStructure.elements.axes.items[1].removeTrigger);

    const newAxisId =
      helper.chartEditorStructure.elements.axes.items.map(({ id }) => id);
    expect(newAxisId).to.deep.equal([axesIds[0]]);

    await click('.undo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(2);

    await click('.redo-btn');

    expect(helper.chartEditorStructure.elements.axes.items).to.have.length(1);
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

  get chartEditorStructure() {
    return getChartEditorStructure();
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

function getChartEditorStructure() {
  const chartEditor = find('.chart-editor');

  const structure = {
    isActive: Boolean(chartEditor),
    elements: {
      series: {},
      seriesGroups: {},
      axes: {},
    },
  };
  if (!structure.isActive) {
    return structure;
  }

  const elements = chartEditor.querySelector('.chart-editor-elements');
  const elementsTabs = elements.querySelectorAll('.nav-link');
  structure.elements.series.tab = elementsTabs[0];
  structure.elements.seriesGroups.tab = elementsTabs[1];
  structure.elements.axes.tab = elementsTabs[2];

  const seriesList = elements.querySelector('.series-list');
  structure.elements.series.addTrigger = seriesList.querySelector('.add-series-btn');
  structure.elements.series.items = [...seriesList.querySelectorAll('.elements-list-item')].map((element) => {
    return getElementsListItemDetails(element, (element, details) => {
      const colorMark = element.querySelector('.color-mark');
      details.color = colorMark ?
        getComputedStyle(colorMark).getPropertyValue('--series-color')?.trim() : null;
      details.type = element.querySelector('.type')?.innerText ?? null;
      details.axisName = element.querySelector('.axis-name')?.innerText ?? null;
      details.seriesGroupName = element.querySelector('.series-group-name')?.innerText ?? null;
      details.seriesCount =
        Number.parseInt(element.querySelector('.series-count')?.innerText ?? 0);
    });
  });

  const seriesGroupsList = elements.querySelector('.series-groups-list');
  structure.elements.seriesGroups.addTrigger =
    seriesGroupsList.querySelector('.add-series-group-btn');
  structure.elements.seriesGroups.items = [
    ...seriesGroupsList.querySelectorAll('.elements-list > .list-items > .elements-list-item'),
  ].map((element) => {
    return getElementsListItemDetails(
      element,
      (element, details, customPropsGetter) => {
        details.stacked = element.innerText.includes('Stack');
        details.showSum = element.innerText.includes('Sum');
        details.seriesCount =
          Number.parseInt(element.querySelector('.series-count')?.innerText ?? 0);
        details.items = [...element.querySelectorAll(':scope > .nested-items > .elements-list-item')]
          .map((subelement) =>
            getElementsListItemDetails(subelement, customPropsGetter)
          );
      }
    );
  });

  const axesList = elements.querySelector('.axes-list');
  structure.elements.axes.addTrigger = axesList.querySelector('.add-axis-btn');
  structure.elements.axes.items = [...axesList.querySelectorAll('.elements-list-item')].map((element) => {
    return getElementsListItemDetails(element, (element, details) => {
      details.unitName = element.querySelector('.unit-name')?.innerText ?? null;
      details.seriesCount =
        Number.parseInt(element.querySelector('.series-count')?.innerText ?? 0);
    });
  });

  return structure;
}

function getElementsListItemDetails(element, customPropsGetter) {
  const details = {
    id: element.dataset.elementId,
    element,
    headerElement: element.querySelector('.list-item-header'),
    name: element.querySelector('.name').innerText,
    addTrigger: element.querySelector('.add-action'),
    duplicateTrigger: element.querySelector('.duplicate-action'),
    removeTrigger: element.querySelector('.remove-action'),
  };
  customPropsGetter(element, details, customPropsGetter);
  return details;
}

function getDropTargetSelector(id, placement) {
  return `[data-reference-element-id="${id}"][data-placement="${placement}"] .drop-zone`;
}
