import { htmlSafe } from '@ember/string';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one atlas', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('_window', {
      resizeListener: null,
      innerWidth: 800,
      addEventListener(event, listener) {
        this.resizeListener = listener;
      },
      removeEventListener() {
        this.resizeListener = null;
      },
    });
  });

  it('scales up to parent size', async function () {
    const size = 400;
    this.set('parentStyle', htmlSafe(`width: ${size}px; height: ${size}px`));
    await render(hbs `
      <div style={{parentStyle}}>
        {{one-atlas _window=_window}}
      </div>
    `);

    const atlas = this.$('.one-atlas');
    expect(atlas.width()).to.be.equal(size);
    expect(atlas.height()).to.be.gt(0);
    // map has horizontal layout
    expect(atlas.height()).to.be.lt(size);
  });

  it('fits to parent with horizontal layout', async function () {
    const width = 400;
    const height = 40;
    this.set('parentStyle', htmlSafe(`width: ${width}px; height: ${height}px`));
    await render(hbs `
      <div style={{parentStyle}}>
        {{one-atlas _window=_window}}
      </div>
    `);

    const atlas = this.$('.one-atlas');
    expect(atlas.height()).to.be.equal(height);
    expect(atlas.width()).to.be.gt(0);
    expect(atlas.width()).to.be.lt(width);
  });

  it('reacts to window resize', async function () {
    let size = 400;
    this.set('parentStyle', htmlSafe(`width: ${size}px; height: ${size}px`));
    await render(hbs `
      <div style={{parentStyle}}>
        {{one-atlas _window=_window}}
      </div>
    `);

    const atlas = this.$('.one-atlas');
    size = size / 2;
    this.set('parentStyle', htmlSafe(`width: ${size}px; height: ${size}px`));
    this.get('_window.resizeListener').call(null);
    await settled();

    expect(atlas.width()).to.be.equal(size);
    expect(atlas.height()).to.be.gt(0);
    expect(atlas.height()).to.be.lt(size);
  });

  it('displays Sydney point in the right down corner of the map',
    async function () {
      const size = 400;
      this.set('parentStyle', htmlSafe(`width: ${size}px; height: ${size}px`));
      await render(hbs `
        <div style={{parentStyle}}>
          {{#one-atlas _window=_window as |atlas|}}
            {{#atlas.position latitude=-33 longitude=151 as |position|}}
              {{#position.point class="sydney"}}
                s
              {{/position.point}}
            {{/atlas.position}}
          {{/one-atlas}}
        </div>
      `);

      const atlas = this.$('.one-atlas');
      const sydney = this.$('.sydney');
      await settled();

      expect(sydney.position().left).to.be.gt((atlas.width() / 4) * 3);
      expect(sydney.position().top).to.be.gt(atlas.height() / 2);
    }
  );
});
