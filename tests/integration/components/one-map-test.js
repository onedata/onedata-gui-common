import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import _ from 'lodash';
import wait from 'ember-test-helpers/wait';

function getRelativePosition($parent, $child) {
  const pPosition = $parent.position();
  const cPosition = $child.position();
  return {
    left: cPosition.left - pPosition.left,
    top: cPosition.top - pPosition.top,
  };
}

function isElementVisible(context, $child) {
  const $parent = context.$('svg');
  const relativePosition = getRelativePosition($parent, $child);
  // -1 because of some subpixel malfunctions
  return relativePosition.top > -1 && relativePosition.left > -1 &&
    relativePosition.left + $child.width() <= $parent.width() &&
    relativePosition.top + $child.height() < $parent.height();
}

function getMapObject(context) {
  return context.$('.one-map-container').vectorMap('get', 'mapObject');
}

describe('Integration | Component | one map', function () {
  setupComponentTest('one-map', {
    integration: true
  });

  it('shows whole world map by default', function () {
    this.render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map}}
      </div>
    `);
    [
      '[data-code="US"]',
      '[data-code="NZ"]',
      '[data-code="GL"]',
    ].forEach((selector) =>
      expect(isElementVisible(this, this.$(selector))).to.be.true
    );
  });

  it('notifies after map viewport change', function () {
    const spy = sinon.spy();
    this.on('spy', spy);
    this.render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map onViewportChange=(action "spy")}}
      </div>
    `);
    const mapObject = getMapObject(this);

    mapObject.setFocus({
      lat: 50,
      lng: 20,
      scale: 7,
    });
    expect(spy).to.be.called;
    const arg = spy.lastCall.args[0];
    expect(_.inRange(arg.lat, 49, 51)).to.be.true;
    expect(_.inRange(arg.lng, 19, 21)).to.be.true;
    expect(_.inRange(arg.scale, 6, 8)).to.be.true;
  });

  it(
    'triggers window event on viewport change if event has been specified',
    function () {
      const eventSpy = sinon.spy();
      const _window = {
        dispatchEvent: eventSpy,
      }
      this.set('_window', _window);
      this.render(hbs `
        <div style="width: 1400px; height: 700px">
          {{one-map _window=_window triggerWindowEventName="mapTestResize"}}
        </div>
      `);
      expect(eventSpy.lastCall.args[0].type).to.be.equal('mapTestResize');
    }
  );

  it('allows to setup initial viewport state (zoom on Poland)', function () {
    this.set('initialState', {
      lat: 50,
      lng: 20,
      scale: 7,
    });
    this.render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map initialState=initialState}}
      </div>
    `);
    expect(isElementVisible(this, this.$('[data-code="PL"]'))).to.be.true;
    expect(isElementVisible(this, this.$('[data-code="TN"]'))).to.be.false;
    expect(isElementVisible(this, this.$('[data-code="PT"]'))).to.be.false;
    expect(isElementVisible(this, this.$('[data-code="KZ"]'))).to.be.false;
  });

  it('positions content using position component', function () {
    this.render(hbs `
      <div style="width: 1400px; height: 700px">
        {{#one-map as |map|}}
          {{#map.position latitude=50 longitude=20}}
            test
          {{/map.position}}
        {{/one-map}}
      </div>
    `);
    return wait().then(() => {
      const $position = this.$('.map-position-container');
      const left = parseFloat($position.css('left'));
      const top = parseFloat($position.css('top'));
      const mapObject = getMapObject(this);
      const coords = mapObject.pointToLatLng(left, top);
      expect(_.inRange(coords.lat, 49, 51)).to.be.true;
      expect(_.inRange(coords.lng, 19, 21)).to.be.true;
    });
  });
});
