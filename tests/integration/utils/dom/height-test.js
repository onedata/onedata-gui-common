import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/height', function () {
  setupRenderingTest();

  it('returns element\'s height when box-sizing is content-box', async function () {
    this.set('style', getDivStyles('content-box', 100, [1, 2], [3, 4], [5, 6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 103, 110, 121]);
  });

  it('returns element\'s height when box-sizing is border-box', async function () {
    this.set('style', getDivStyles('border-box', 100, [1, 2], [3, 4], [5, 6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [90, 93, 100, 111]);
  });

  it('returns element\'s height when only height is set', async function () {
    this.set('style', getDivStyles('border-box', 100));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s height when it\'s height was set if em unit', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box') + 'height: 1em;'));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    const emSize = parseFloat(window.getComputedStyle(div).fontSize);

    expectWidth(div, [emSize, emSize, emSize, emSize]);
  });

  it('returns element\'s height when padding is negative', async function () {
    this.set('style', getDivStyles('border-box', 100, [-1, -2]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s height when border has negative height', async function () {
    this.set('style', getDivStyles('border-box', 100, [null, null], [-3, -4]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s height when margin is negative', async function () {
    this.set('style', getDivStyles('border-box', 100, [null, null], [null, null], [-5, -6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s height when absolute positioned child element is outside', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box', 100) + 'position: relative;'));
    await render(hbs`<div class="div" style={{style}}>
      <div style="position: absolute; bottom: -150px;"></div>
    </div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s height when statically positioned child element is outside', async function () {
    this.set('style', getDivStyles('border-box', 100));
    await render(hbs`<div class="div" style={{style}}>
      <div style="height: 200px;"></div>
    </div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });
});

function expectWidth(element, boxWidths) {
  [
    dom.LayoutBox.ContentBox,
    dom.LayoutBox.PaddingBox,
    dom.LayoutBox.BorderBox,
    dom.LayoutBox.MarginBox,
  ].forEach((layoutBox, idx) =>
    expect(dom.height(element, layoutBox)).to.equal(boxWidths[idx])
  );
}

function getDivStyles(
  boxSizing,
  height = null,
  [paddingLeft, paddingRight] = [null, null],
  [borderLeft, borderRight] = [null, null],
  [marginLeft, marginRight] = [null, null]
) {
  let style = boxSizing ? `box-sizing: ${boxSizing};` : '';
  style += height !== null ? `height: ${height}px;` : '';
  style += paddingLeft !== null ? `padding-top: ${paddingLeft}px;` : '';
  style += paddingRight !== null ? `padding-bottom: ${paddingRight}px;` : '';
  style += borderLeft !== null ? `border-top: ${borderLeft}px solid;` : '';
  style += borderRight !== null ? `border-bottom: ${borderRight}px solid;` : '';
  style += marginLeft !== null ? `margin-top: ${marginLeft}px;` : '';
  style += marginRight !== null ? `margin-bottom: ${marginRight}px;` : '';
  style = htmlSafe(style);
  return style;
}
