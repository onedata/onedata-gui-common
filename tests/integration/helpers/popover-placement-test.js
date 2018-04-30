import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | popover placement', function () {
  setupComponentTest('popover-placement', {
    integration: true
  });

  [
    { placement: 'left-top', x: 60, y: 70 },
    { placement: 'left', x: 60, y: 50 },
    { placement: 'left-bottom', x: 60, y: 20 },
    { placement: 'right-top', x: 40, y: 70 },
    { placement: 'right', x: 40, y: 50 },
    { placement: 'right-bottom', x: 40, y: 20 },
  ].forEach((testCase) =>
    it(`calculates ${testCase.placement} placement`, function () {
      this.set('x', testCase.x);
      this.set('y', testCase.y);
      this.render(hbs `{{popover-placement
        width=100
        height=100
        x=x
        y=y}}
      `);
      expect(this.$().text().trim()).to.equal(testCase.placement);
    })
  );
});
