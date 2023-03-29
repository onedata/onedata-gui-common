import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties, set } from '@ember/object';
import sinon from 'sinon';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';
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
    expect(triggers).to.have.length(1);
    expect(triggers[0]).to.contain.text('Add subsection');
  });

  it('triggers subsection creation on "add subsection" click', async function () {
    const executeSpy = sinon.spy();
    this.actionsFactory.createAddSubsectionAction = sinon.spy(() => ({
      execute: executeSpy,
    }));
    await renderComponent();
    expect(this.actionsFactory.createAddSubsectionAction).to.be.not.called;

    await click('.add-subsection');

    expect(this.actionsFactory.createAddSubsectionAction).to.be.calledOnce
      .and.calledWith({ targetSection: this.section });
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
