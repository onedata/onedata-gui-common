import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import sinon from 'sinon';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';

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
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor
    rootSection=rootSection
    onRemoveDashboard=onRemoveDashboard
  }}`);
}
