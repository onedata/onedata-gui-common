import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one atlas', function () {
  setupComponentTest('one-atlas', {
    integration: true
  });

  beforeEach(function () {
    this.set('_window', {
      resizeListener: null,
      innerWidth: 800,
      addEventListener(event, listener) {
        this.resizeListener = listener;
      },
      removeEventListener() {
        this.resizeListener = null;
      }
    });
  });

  it('scales up to parent size', function () {
    let size = 400;
    this.setProperties({
      parentWidth: size,
      parentHeight: size,
    });
    this.render(hbs `
      <div style="width: {{parentWidth}}px; height: {{parentHeight}}px">
        {{one-atlas _window=_window}}
      </div>
    `);

    let atlas = this.$('.one-atlas');
    expect(atlas.width()).to.be.equal(size);
    expect(atlas.height()).to.be.gt(0);
    // map has horizontal layout
    expect(atlas.height()).to.be.lt(size);
  });

  it('fits to parent with horizontal layout', function () {
    let width = 400;
    let height = 40;
    this.setProperties({
      parentWidth: width,
      parentHeight: height,
    });
    this.render(hbs `
      <div style="width: {{parentWidth}}px; height: {{parentHeight}}px">
        {{one-atlas _window=_window}}
      </div>
    `);

    let atlas = this.$('.one-atlas');
    expect(atlas.height()).to.be.equal(height);
    expect(atlas.width()).to.be.gt(0);
    expect(atlas.width()).to.be.lt(width);
  });

  it('reacts to window resize', function (done) {
    let size = 400;
    this.setProperties({
      parentWidth: size,
      parentHeight: size,
    });
    this.render(hbs `
      <div style="width: {{parentWidth}}px; height: {{parentHeight}}px">
        {{one-atlas _window=_window}}
      </div>
    `);

    let atlas = this.$('.one-atlas');
    size = size / 2;
    this.setProperties({
      parentWidth: size,
      parentHeight: size,
    });
    this.get('_window.resizeListener').call(null);
    wait().then(() => {
      expect(atlas.width()).to.be.equal(size);
      expect(atlas.height()).to.be.gt(0);
      expect(atlas.height()).to.be.lt(size);
      done();
    });
  });

  it('displays Sydney point in the right down corner of the map',
    function (done) {
      let size = 400;
      this.setProperties({
        parentWidth: size,
        parentHeight: size,
      });
      this.render(hbs `
        <div style="width: {{parentWidth}}px; height: {{parentHeight}}px">
          {{#one-atlas _window=_window as |atlas|}}
            {{#atlas.point latitude=-33 longitude=151 class="sydney"}}
              s
            {{/atlas.point}}
          {{/one-atlas}}
        </div>
      `);

      let atlas = this.$('.one-atlas');
      let sydney = this.$('.sydney');
      wait().then(() => {
        expect(sydney.position().left).to.be.gt((atlas.width() / 4) * 3);
        expect(sydney.position().top).to.be.gt(atlas.height() / 2);
        done();
      });
    }
  );
});
