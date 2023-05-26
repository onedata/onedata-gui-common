import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { observer } from '@ember/object';
import createRenderableProperty from 'onedata-gui-common/utils/create-renderable-property';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

describe('Integration | Utility | create-renderable-property', function () {
  setupRenderingTest();

  it('modifies renderable property only once for multiple dependent property modifications', async function () {
    const cls = EmberObject.extend({
      something: 'a',
      somethingRenderable: undefined,

      somethingCount: 0,
      somethingRenderableCount: 0,

      init() {
        this._super(...arguments);
        createRenderableProperty(
          this,
          'something',
          'somethingRenderable',
        );
        // activate observers
        this.something;
        this.somethingRenderable;
      },
      somethingObserver: observer('something', function () {
        this.incrementProperty('somethingCount');
      }),
      somethingRenderableObserver: observer('somethingRenderable', function () {
        this.incrementProperty('somethingRenderableCount');
      }),
    });
    const obj = cls.create();
    this.set('obj', obj);

    await render(hbs`{{obj.somethingRenderableCount}}`);
    obj.set('something', 'b');
    obj.set('something', 'c');
    obj.set('something', 'd');

    // before render, the renderable property should not change
    expect(obj.somethingRenderable).to.equal('a');
    await waitForRender();
    expect(obj.somethingCount).to.equal(3);
    expect(obj.somethingRenderableCount).to.equal(1);
    expect(obj.somethingRenderable).to.equal(obj.something);
  });
});
