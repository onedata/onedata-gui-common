import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import _ from 'lodash';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

function getRelativePosition(parent, child) {
  const pPosition = dom.offset(parent);
  const cPosition = dom.offset(child);
  return {
    left: cPosition.left - pPosition.left,
    top: cPosition.top - pPosition.top,
  };
}

function isElementVisible(child) {
  const parent = find('svg');
  const relativePosition = getRelativePosition(parent, child);
  // -1 because of some subpixel malfunctions
  return relativePosition.top > -1 && relativePosition.left > -1 &&
    relativePosition.left + dom.width(child) <= dom.width(parent) &&
    relativePosition.top + dom.height(child) < dom.height(parent);
}

function getMapObject() {
  return find('.one-map-container').mapInstance;
}

describe('Integration | Component | one-map', function () {
  setupRenderingTest();

  it('shows whole world map by default', async function () {
    await render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map}}
      </div>
    `);
    [
      '[data-code="US"]',
      '[data-code="NZ"]',
      '[data-code="GL"]',
    ].forEach((selector) =>
      expect(isElementVisible(find(selector))).to.be.true
    );
  });

  it('notifies after map viewport change', async function () {
    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map onViewportChange=(action spy)}}
      </div>
    `);
    const mapObject = getMapObject();

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
    async function () {
      const eventSpy = sinon.spy();
      globals.mock('window', {
        dispatchEvent: eventSpy,
      });
      await render(hbs `
        <div style="width: 1400px; height: 700px">
          {{one-map triggerWindowEventName="mapTestResize"}}
        </div>
      `);
      expect(eventSpy.lastCall.args[0].type).to.be.equal('mapTestResize');
    }
  );

  it('allows to setup initial viewport state (zoom on Poland)', async function () {
    this.set('initialState', {
      lat: 50,
      lng: 20,
      scale: 7,
    });
    await render(hbs `
      <div style="width: 1400px; height: 700px">
        {{one-map initialState=initialState}}
      </div>
    `);
    expect(isElementVisible(find('[data-code="PL"]'))).to.be.true;
    expect(isElementVisible(find('[data-code="TN"]'))).to.be.false;
    expect(isElementVisible(find('[data-code="PT"]'))).to.be.false;
    expect(isElementVisible(find('[data-code="KZ"]'))).to.be.false;
  });

  it('positions content using position component', async function () {
    await render(hbs `
      <div style="width: 1400px; height: 700px">
        {{#one-map as |map|}}
          {{#map.position latitude=50 longitude=20}}
            test
          {{/map.position}}
        {{/one-map}}
      </div>
    `);

    const position = find('.map-position-container');
    const left = parseFloat(dom.getStyle(position, 'left'));
    const top = parseFloat(dom.getStyle(position, 'top'));
    const mapObject = getMapObject();
    const coords = mapObject.pointToLatLng(left, top);
    expect(_.inRange(coords.lat, 49, 51)).to.be.true;
    expect(_.inRange(coords.lng, 19, 21)).to.be.true;
  });
});
