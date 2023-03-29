import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/section', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('section', createNewSection(this.owner.lookup('service:i18n')));
  });

  it('has class "section"', async function () {
    await renderComponent();

    expect(find('.section')).to.exist;
  });

  it('shows title and title tip according to passed model', async function () {
    setProperties(this.section, {
      title: 'title1',
      titleTip: 'tip1',
    });

    await renderComponent();

    expect(find('.section-title')).to.have.text('title1');
    expect(await new OneTooltipHelper('.section-title-tip .one-icon').getText())
      .to.equal('tip1');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/section
    section=section
  }}`);
}
