import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties, set } from '@ember/object';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/section', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('section', createSection(this));
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
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/section
    section=section
  }}`);
}

function createSection(testCase, props = {}) {
  const section = createNewSection(testCase.owner.lookup('service:i18n'));
  setProperties(section, props);
  return section;
}
