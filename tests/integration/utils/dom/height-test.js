import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/height', function () {
  setupRenderingTest();

  it('returns element\'s height when box-sizing is content-box', async function () {
    this.set('style', getDivStyles('content-box', {
      height: 100,
      paddingTop: 1,
      paddingBottom: 2,
      borderTop: 3,
      borderBottom: 4,
      marginTop: 5,
      marginBottom: 6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 103,
      [dom.LayoutBox.BorderBox]: 110,
      [dom.LayoutBox.MarginBox]: 121,
    });
  });

  it('returns element\'s height when box-sizing is border-box', async function () {
    this.set('style', getDivStyles('border-box', {
      height: 100,
      paddingTop: 1,
      paddingBottom: 2,
      borderTop: 3,
      borderBottom: 4,
      marginTop: 5,
      marginBottom: 6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 90,
      [dom.LayoutBox.PaddingBox]: 93,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 111,
    });
  });

  it('returns element\'s height when only height is set', async function () {
    this.set('style', getDivStyles('border-box', { height: 100 }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s height when it\'s height was set in em unit', async function () {
    this.set('style', htmlSafe(getDivStyles('border-box') + 'height: 1em;'));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    const emSize = parseFloat(window.getComputedStyle(div).fontSize);

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: emSize,
      [dom.LayoutBox.PaddingBox]: emSize,
      [dom.LayoutBox.BorderBox]: emSize,
      [dom.LayoutBox.MarginBox]: emSize,
    });
  });

  it('returns element\'s height when padding is negative', async function () {
    this.set('style', getDivStyles('border-box', {
      height: 100,
      paddingTop: -1,
      paddingBottom: -2,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s height when border has negative height', async function () {
    this.set('style', getDivStyles('border-box', {
      height: 100,
      borderTop: -3,
      borderBottom: -4,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s height when margin is negative', async function () {
    this.set('style', getDivStyles('border-box', {
      height: 100,
      marginTop: -5,
      marginBottom: -6,
    }));
    await render(hbs`<div class="div" style={{style}}></div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s height when absolute positioned child element causes overflow', async function () {
    this.set('style', htmlSafe(
      getDivStyles('border-box', { height: 100 }) + 'position: relative;'
    ));
    await render(hbs`<div class="div" style={{style}}>
      <div style="position: absolute; bottom: -150px;"></div>
    </div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });

  it('returns element\'s height when statically positioned child element causes overflow', async function () {
    this.set('style', getDivStyles('border-box', { height: 100 }));
    await render(hbs`<div class="div" style={{style}}>
      <div style="height: 200px;"></div>
    </div>`);
    const div = find('.div');

    expectHeight(div, {
      [dom.LayoutBox.ContentBox]: 100,
      [dom.LayoutBox.PaddingBox]: 100,
      [dom.LayoutBox.BorderBox]: 100,
      [dom.LayoutBox.MarginBox]: 100,
    });
  });
});

function expectHeight(element, boxWidths) {
  [
    dom.LayoutBox.ContentBox,
    dom.LayoutBox.PaddingBox,
    dom.LayoutBox.BorderBox,
    dom.LayoutBox.MarginBox,
  ].forEach((layoutBox) =>
    expect(dom.height(element, layoutBox)).to.equal(boxWidths[layoutBox])
  );
}

function getDivStyles(boxSizing, {
  height = null,
  paddingTop = null,
  paddingBottom = null,
  borderTop = null,
  borderBottom = null,
  marginTop = null,
  marginBottom = null,
} = {}) {
  // Testing environment shows element scaled down to 50% of it's original
  // dimensions. It disturbs element measurement by `getBoundingClientRect` -
  // values are incorrect by +/- 1px.
  // We need to scale the element up back to at least 100% of it's original size.
  // Element now is scaled to 50%, so we have to scale it by 200% to go
  // back to original 100%.
  let style = 'zoom: 200%;';
  style += boxSizing !== null ? `box-sizing: ${boxSizing};` : '';
  style += height !== null ? `height: ${height}px;` : '';
  style += paddingTop !== null ? `padding-top: ${paddingTop}px;` : '';
  style += paddingBottom !== null ? `padding-bottom: ${paddingBottom}px;` : '';
  style += borderTop !== null ? `border-top: ${borderTop}px solid;` : '';
  style += borderBottom !== null ? `border-bottom: ${borderBottom}px solid;` : '';
  style += marginTop !== null ? `margin-top: ${marginTop}px;` : '';
  style += marginBottom !== null ? `margin-bottom: ${marginBottom}px;` : '';
  style = htmlSafe(style);
  return style;
}
