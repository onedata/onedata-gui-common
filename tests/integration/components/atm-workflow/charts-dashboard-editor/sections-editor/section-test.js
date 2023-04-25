import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties, set } from '@ember/object';
import sinon from 'sinon';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/section', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      section: createSection(this),
      actionsFactory: {},
    });
  });

  it('has class "section"', async function () {
    await renderComponent();

    expect(find('.section')).to.exist;
  });

  it('shows title, title tip and description according to passed model', async function () {
    setProperties(this.section, {
      title: 'title1',
      titleTip: 'tip1',
      description: 'desc',
    });

    await renderComponent();

    expect(find('.section-title')).to.have.text('title1');
    expect(await new OneTooltipHelper('.section-title-tip .one-icon').getText())
      .to.equal('tip1');
    expect(find('.section-description')).to.have.text('desc');
  });

  it('shows nested sections', async function () {
    set(this.section, 'sections', [
      createSection(this, { title: 's1' }),
      createSection(this, { title: 's2' }),
    ]);

    await renderComponent();

    const subsections = findAll('.section .section');
    expect(subsections).to.have.length(2);
    expect(subsections[0]).to.contain.text('s1');
    expect(subsections[1]).to.contain.text('s2');
  });

  it('shows creation triggers', async function () {
    await renderComponent();

    const triggers = findAll('.large-trigger');
    expect(triggers).to.have.length(2);
    expect(triggers[0]).to.contain.text('Add chart');
    expect(triggers[1]).to.contain.text('Add subsection');
  });

  it('triggers chart creation on "add chart" click', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createAddElementAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createAddElementAction).to.be.not.called;

    await click('.add-chart');

    expect(this.actionsFactory.createAddElementAction).to.be.calledOnce
      .and.calledWith({
        newElementType: ElementType.Chart,
        targetElement: this.section,
      });
    expect(executeSpy).to.be.calledOnce;
  });

  it('triggers subsection creation on "add subsection" click', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createAddElementAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createAddElementAction).to.be.not.called;

    await click('.add-subsection');

    expect(this.actionsFactory.createAddElementAction).to.be.calledOnce
      .and.calledWith({
        newElementType: ElementType.Section,
        targetElement: this.section,
      });
    expect(executeSpy).to.be.calledOnce;
  });

  it('has floating toolbar', async function () {
    await renderComponent();

    expect(find('.floating-toolbar')).to.exist;
  });

  it('does not have floating toolbar when is a root section', async function () {
    this.set('section.isRoot', true);

    await renderComponent();

    expect(find('.floating-toolbar')).to.not.exist;
  });

  it('triggers action on action trigger click in floating toolbar', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createRemoveElementAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createRemoveElementAction).to.be.not.called;

    await click('.floating-toolbar .remove-action');

    expect(this.actionsFactory.createRemoveElementAction).to.be.calledOnce
      .and.calledWith({ elementToRemove: this.section });
    expect(executeSpy).to.be.calledOnce;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/section
    section=section
    actionsFactory=actionsFactory
  }}`);
}

function createSection(testCase, props = {}) {
  const section = createNewSection(testCase.owner.lookup('service:i18n'));
  setProperties(section, props);
  return section;
}
