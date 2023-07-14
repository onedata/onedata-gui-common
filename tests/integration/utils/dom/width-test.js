import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

// WARNING: Tests below are fragile to zoom < 100%.

describe('Integration | Utility | dom/width', function () {
  setupRenderingTest();

  it('returns element\'s width when box-sizing is content-box', async function () {
    this.set('style', getDivStyles('content-box', {
      width: 100,
      paddingLeft: 1,
      paddingRight: 2,
      borderLeft: 3,
      borderRight: 4,
      marginLeft: 5,
      marginRight: 6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 103,
      [dom.LayoutBox.BorderBox]: 110,
      [dom.LayoutBox.MarginBox]: 121,
    });
  });

  it('returns element\'s width when box-sizing is border-box', async function () {
    this.set('style', getDivStyles('border-box', {
      width: 100,
      paddingLeft: 1,
      paddingRight: 2,
      borderLeft: 3,
      borderRight: 4,
      marginLeft: 5,
      marginRight: 6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 90,
      [dom.LayoutBox.PaddingBox]: 93,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 111,
    });
  });

  it('returns element\'s width when only width is set', async function () {
    this.set('style', getDivStyles('border-box', { width: 100 }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s width when it\'s width was set if em unit', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box') + 'width: 1em;'));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    const emSize = parseFloat(globals.window.getComputedStyle(div).fontSize);

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: emSize,
      [dom.LayoutBox.PaddingBox]: emSize,
      [dom.LayoutBox.BorderBox]: emSize,
      [dom.LayoutBox.MarginBox]: emSize,
    });
  });

  it('returns element\'s width when padding is negative', async function () {
    this.set('style', getDivStyles('border-box', {
      width: 100,
      paddingLeft: -1,
      paddingRight: -2,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s width when border has negative width', async function () {
    this.set('style', getDivStyles('border-box', {
      width: 100,
      borderLeft: -3,
      borderRight: -4,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s width when margin is negative', async function () {
    this.set('style', getDivStyles('border-box', {
      width: 100,
      marginLeft: -5,
      marginRight: -6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s width when absolute positioned child element causes overflow', async function () {
    this.set('style', htmlSafe(
      getDivStyles('border-box', { width: 100 }) + 'position: relative;'
    ));
    await render(hbs`<div class="div" style={{style}}>
      <div style="position: absolute; right: -150px;"></div>
    </div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s width when statically positioned child element causes overflow', async function () {
    this.set('style', getDivStyles('border-box', { width: 100 }));
    await render(hbs`<div class="div" style={{style}}>
      <div style="width: 200px;"></div>
    </div>`);
    const div = find('.div');

    expectWidth(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });
});

function expectWidth(element, boxWidths) {
  [
    dom.LayoutBox.ContentBox,
    dom.LayoutBox.PaddingBox,
    dom.LayoutBox.BorderBox,
    dom.LayoutBox.MarginBox,
  ].forEach((layoutBox) =>
    expect(dom.width(element, layoutBox)).to.equal(boxWidths[layoutBox])
  );
}

function getDivStyles(boxSizing, {
  width = null,
  paddingLeft = null,
  paddingRight = null,
  borderLeft = null,
  borderRight = null,
  marginLeft = null,
  marginRight = null,
} = {}) {
  let style = '';
  style += boxSizing !== null ? `box-sizing: ${boxSizing};` : '';
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
