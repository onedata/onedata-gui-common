import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/width', function () {
  setupRenderingTest();

  it('returns element\'s width when box-sizing is content-box', async function () {
    this.set('style', getDivStyles('content-box', 100, [1, 2], [3, 4], [5, 6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 103, 110, 121]);
  });

  it('returns element\'s width when box-sizing is border-box', async function () {
    this.set('style', getDivStyles('border-box', 100, [1, 2], [3, 4], [5, 6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [90, 93, 100, 111]);
  });

  it('returns element\'s width when only width is set', async function () {
    this.set('style', getDivStyles('border-box', 100));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s width when it\'s width was set if em unit', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box') + 'width: 1em;'));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    const emSize = parseFloat(window.getComputedStyle(div).fontSize);

    expectWidth(div, [emSize, emSize, emSize, emSize]);
  });

  it('returns element\'s width when padding is negative', async function () {
    this.set('style', getDivStyles('border-box', 100, [-1, -2]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s width when border has negative width', async function () {
    this.set('style', getDivStyles('border-box', 100, [null, null], [-3, -4]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s width when margin is negative', async function () {
    this.set('style', getDivStyles('border-box', 100, [null, null], [null, null], [-5, -6]));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s width when absolute positioned child element is outside', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box', 100) + 'position: relative;'));
    await render(hbs`<div class="div" style={{style}}>
      <div style="position: absolute; right: -150px;"></div>
    </div>`);
    const div = find('.div');

    expectWidth(div, [100, 100, 100, 100]);
  });

  it('returns element\'s width when statically positioned child element is outside', async function () {
    this.set('style', getDivStyles('border-box', 100));
    await render(hbs`<div class="div" style={{style}}>
      <div style="width: 200px;"></div>
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
    expect(dom.width(element, layoutBox)).to.equal(boxWidths[idx])
  );
}

function getDivStyles(
  boxSizing,
  width = null,
  [paddingLeft, paddingRight] = [null, null],
  [borderLeft, borderRight] = [null, null],
  [marginLeft, marginRight] = [null, null]
) {
  let style = boxSizing ? `box-sizing: ${boxSizing};` : '';
  style += width !== null ? `width: ${width}px;` : '';
  style += paddingLeft !== null ? `padding-left: ${paddingLeft}px;` : '';
  style += paddingRight !== null ? `padding-right: ${paddingRight}px;` : '';
  style += borderLeft !== null ? `border-left: ${borderLeft}px solid;` : '';
  style += borderRight !== null ? `border-right: ${borderRight}px solid;` : '';
  style += marginLeft !== null ? `margin-left: ${marginLeft}px;` : '';
  style += marginRight !== null ? `margin-right: ${marginRight}px;` : '';
  style = htmlSafe(style);
  return style;
}
