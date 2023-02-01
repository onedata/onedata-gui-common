import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/position', function () {
  setupRenderingTest();

  it('returns element\'s position relative to the closest positioned element', async function () {
    await render(hbs`<div style="position: relative; padding-top: 10px;">
      <div style="margin-left: -5px; padding-top: 20px;">
        <div class="test"></div>
      </div>
    </div>`);

    const testDiv = find('.test');
    expect(dom.position(testDiv)).to.deep.equal({
      top: 30,
      left: -5,
    });
  });

  it('returns element\'s position relative to the passed reference element', async function () {
    await render(hbs`
      <div class="test" style="position: absolute; top: 40px; left: 60px;"></div>
      <div class="ref" style="position: absolute; top: 100px; left: 20px;"></div>
    `);

    expect(dom.position(find('.test'), find('.ref'))).to.deep.equal({
      top: -60,
      left: 40,
    });
  });

  it('takes into account outer-top-left border corners when calculating position', async function () {
    await render(hbs`
      <div class="test" style="position: absolute; top: 40px; left: 60px; border: 3px solid black; padding: 7px; margin: 8px;"></div>
      <div class="ref" style="position: absolute; top: 100px; left: 20px; border: 5px solid black; padding: 9px; margin: 11px;"></div>
    `);

    expect(dom.position(find('.test'), find('.ref'))).to.deep.equal({
      top: -63,
      left: 37,
    });
  });
});
