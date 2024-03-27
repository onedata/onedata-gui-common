import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, settled, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import sinon from 'sinon';
import {
  createNewSeries,
  createNewSeriesGroup,
  createNewAxis,
  EditorContext,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

describe('Integration | Component | atm-workflow/chart-dashboard-editor/chart-editor/elements-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const selectSpy = sinon.spy((elementToSelect) =>
      this.set('selectedElement', elementToSelect)
    );
    this.setProperties({
      i18n: this.owner.lookup('service:i18n'),
      editorContext: EditorContext.create({
        actionsFactory: {
          createSelectElementAction: ({ elementToSelect, elementsToDeselect }) => ({
            execute: () => selectSpy(elementToSelect, elementsToDeselect),
          }),
        },
      }),
      selectSpy,
    });
  });

  it('has class "chart-editor-elements-editor"', async function () {
    await renderComponent();

    expect(find('.chart-editor-elements-editor')).to.exist;
  });

  it('shows placeholder text when no element is opened', async function () {
    await renderComponent();

    expect(find('.element-editor-nav-link')).to.not.exist;
    const noElementInfo = find('.no-elements-info');
    expect(noElementInfo).to.exist
      .and.to.contain.text('You are not editing any element.')
      .and.to.contain.text('Click on a chart element to start edition.');
  });

  it('opens element editors in tabs after changing "selectedElement"', async function () {
    const series = createNewSeries(this.i18n);
    set(series, 'name', 's1');
    const seriesGroup = createNewSeriesGroup(this.i18n);
    set(seriesGroup, 'name', 'g1');
    const axis = createNewAxis(this.i18n);
    set(axis, 'name', 'a1');
    await renderComponent();

    this.set('selectedElement', series);
    await settled();

    let navLinks = findAll('.element-editor-nav-link');
    let tabPanes = findAll('.element-editor-tab-pane');
    expect(navLinks).to.have.length(1);
    expect(navLinks[0].parentElement).to.have.class('active');
    expect(navLinks[0]).to.contain.text('s1');
    expect(navLinks[0]).to.contain('.oneicon-chart');
    expect(tabPanes).to.have.length(1);
    expect(tabPanes[0]).to.have.class('active');
    expect(tabPanes[0]).to.contain('.series-editor');

    this.set('selectedElement', seriesGroup);
    await settled();

    navLinks = findAll('.element-editor-nav-link');
    tabPanes = findAll('.element-editor-tab-pane');
    expect(navLinks).to.have.length(2);
    expect(navLinks[1].parentElement).to.have.class('active');
    expect(navLinks[1]).to.contain.text('g1');
    expect(navLinks[1]).to.contain('.oneicon-items-grid');
    expect(tabPanes).to.have.length(2);
    expect(tabPanes[1]).to.have.class('active');
    expect(tabPanes[1]).to.contain('.series-group-editor');

    this.set('selectedElement', axis);
    await settled();

    navLinks = findAll('.element-editor-nav-link');
    tabPanes = findAll('.element-editor-tab-pane');
    expect(navLinks).to.have.length(3);
    expect(navLinks[2].parentElement).to.have.class('active');
    expect(navLinks[2]).to.contain.text('a1');
    expect(navLinks[2]).to.contain('.oneicon-axes');
    expect(tabPanes).to.have.length(3);
    expect(tabPanes[2]).to.have.class('active');
    expect(tabPanes[2]).to.contain('.axis-editor');
  });

  it('closes editor tab on close click', async function () {
    await renderComponent();
    const seriesArr = [];
    for (let i = 0; i < 3; i++) {
      const series = createNewSeries(this.i18n);
      set(series, 'name', `s${i}`);
      seriesArr.push(series);
      this.set('selectedElement', series);
      await settled();
    }

    // Close active tab. Previous tab should be selected
    await click('li.active .close-trigger');

    expect(this.selectSpy).to.be.calledWith(seriesArr[1], [seriesArr[2]]);
    this.selectSpy.resetHistory();
    let navLinks = findAll('.element-editor-nav-link');
    expect(navLinks).to.have.length(2);
    expect(navLinks[0]).to.contain.text('s0');
    expect(navLinks[1]).to.contain.text('s1');
    expect(navLinks[1].parentElement).to.have.class('active');

    // Close non-active tab. Active tab should be untouched
    await click('.close-trigger');

    expect(this.selectSpy).to.be.not.called;
    navLinks = findAll('.element-editor-nav-link');
    expect(navLinks).to.have.length(1);
    expect(navLinks[0]).to.contain.text('s1');
    expect(navLinks[0].parentElement).to.have.class('active');
  });

  it('allows to change active tab via click', async function () {
    await renderComponent();
    for (let i = 0; i < 2; i++) {
      const series = createNewSeries(this.i18n);
      set(series, 'name', `s${i}`);
      this.set('selectedElement', series);
      await settled();
    }

    await click('.element-editor-nav-link');

    expect(find('.element-editor-nav-link').parentElement).to.have.class('active');
  });

  it('shows "unnamed" title for unnamed element', async function () {
    await renderComponent();
    const series = createNewSeries(this.i18n);
    set(series, 'name', '');
    this.set('selectedElement', series);
    await settled();

    expect(find('.element-editor-nav-link')).to.contain.text('Unnamed');
  });

  it('reacts to changing element name', async function () {
    await renderComponent();
    const series = createNewSeries(this.i18n);
    this.set('selectedElement', series);
    await settled();

    set(series, 'name', 'test');
    await settled();

    expect(find('.element-editor-nav-link')).to.contain.text('test');
  });

  it('removes tab when element is deleted', async function () {
    await renderComponent();
    const seriesArr = [];
    for (let i = 0; i < 2; i++) {
      const series = createNewSeries(this.i18n);
      set(series, 'name', `s${i}`);
      this.set('selectedElement', series);
      await settled();
      seriesArr.push(series);
    }

    set(seriesArr[1], 'isRemoved', true);
    await settled();

    const navLinks = findAll('.element-editor-nav-link');
    expect(navLinks).to.have.length(1);
    expect(navLinks[0]).to.contain.text('s0');
    expect(navLinks[0].parentElement).to.have.class('active');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/chart-dashboard-editor/chart-editor/elements-editor
    chart=chart
    selectedElement=selectedElement
    editorContext=editorContext
  }}`);
}
