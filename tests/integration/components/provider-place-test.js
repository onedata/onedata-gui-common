import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import { triggerError, triggerSuccess } from '../../helpers/ember-cli-clipboard';
import GlobalNotifyStub from '../../helpers/global-notify-stub';
import I18nStub from '../../helpers/i18n-stub';
import $ from 'jquery';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';

const COPY_SUCCESS_MSG = 'copySuccess';
const COPY_ERROR_MSG = 'copyError';

function triggerCopyClick(context, success = true) {
  // we need to attach this.$ to the whole app $ context, because a popover 
  // renders in the body, not inside the component
  let old$ = context.$;
  context.$ = (selector) => $('body').find(selector);
  if (success) {
    triggerSuccess(context, '.provider-host-copy-btn');
  } else {
    triggerError(context, '.provider-host-copy-btn');
  }
  context.$ = old$;
}

const GuiUtils = Service.extend({
  getRoutableIdFor(id) {
    return id;
  },
});

const Router = Service.extend({
  urlFor() {
    return '#/url';
  },
});

describe('Integration | Component | provider place', function () {
  setupComponentTest('provider-place', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'globalNotify', GlobalNotifyStub);
    registerService(this, 'guiUtils', GuiUtils);
    registerService(this, 'router', Router);

    this.get('globalNotify')._clearMessages();

    this.register('service:i18n', I18nStub);
    this.inject.service('i18n', { as: 'i18n' });
    this.set('i18n.translations', {
      components: {
        providerPlace: {
          drop: {
            hostnameCopySuccess: COPY_SUCCESS_MSG,
            hostnameCopyError: COPY_ERROR_MSG,
          },
        },
      },
    });

    const spaces = [{
      id: 'space1',
      name: 'space1',
      supportSizes: {
        1: 1048576,
      },
    }, {
      id: 'space2',
      name: 'space2',
      supportSizes: {
        1: 1048576,
        2: 2097152,
      },
    }];
    spaces.isFulfilled = true;

    const cluster = {
      workerVersion: {
        release: '20.02.0-alpha',
      },
    };

    const provider = EmberObject.create({
      id: '1',
      entityId: '1',
      name: 'provider1',
      status: 'online',
      spaceList: EmberObject.create({
        isLoaded: true,
        list: resolve(spaces),
      }),
      cluster: resolve(cluster),
    });

    this.set('spaces', spaces);
    this.set('provider', provider);
    this.set('providers', [
      provider,
      Object.assign({}, provider, { id: '2', name: 'provider2' }),
    ]);
  });

  it('shows provider status', function () {
    this.render(hbs `{{provider-place provider=provider}}`);
    const $providerPlace = this.$('.provider-place');
    expect($providerPlace).to.exist;
    expect($providerPlace, $providerPlace.attr('class')).to.have.class('online');
  });

  it('resizes with parent one-atlas component', function () {
    this.set('atlasWidth', 800);
    this.render(hbs `
      {{provider-place 
        provider=provider 
        atlasWidth=atlasWidth}}`);
    let prevWidth = parseFloat(this.$('.circle').css('width'));
    this.set('atlasWidth', 400);
    expect(parseFloat(this.$('.circle').css('width')))
      .to.be.equal(prevWidth / 2);
  });

  it('notifies about hostname copy to clipboard success', function (done) {
    this.render(hbs `
      {{provider-place 
        provider=provider}}`);
    click('.circle').then(() => {
      triggerCopyClick(this);
      expect(this.get('globalNotify.infoMessages')).to.have.length(1);
      expect(this.get('globalNotify.infoMessages')).to.contain(
        COPY_SUCCESS_MSG);
      done();
    });
  });

  it('notifies about hostname copy to clipboard error', function (done) {
    this.render(hbs `
      {{provider-place 
        provider=provider}}`);
    click('.circle').then(() => {
      triggerCopyClick(this, false);
      expect(this.get('globalNotify.infoMessages')).to.have.length(1);
      expect(this.get('globalNotify.infoMessages')).to.contain(COPY_ERROR_MSG);
      done();
    });
  });

  it('shows list of supported spaces', function (done) {
    this.render(hbs `
      {{provider-place 
        provider=provider}}`);

    let spaces = this.get('spaces');
    click('.circle').then(() => {
      let drop = $('.provider-place-drop');
      expect(drop.find('.provider-place-drop-space'))
        .to.have.length(spaces.length);
      spaces.forEach((space) => {
          expect(drop.text()).to.contain(space.name);
        }),
        expect(drop.text()).to.contain('1 MiB');
      done();
    });
  });

  it('shows multiple providers if necessary', function (done) {
    this.render(hbs `
      {{provider-place 
        provider=providers}}`);

    click('.circle').then(() => {
      const dropContainer = $('.provider-place-drop-container');
      expect(dropContainer.find('.oneproviders-list-item'))
        .to.have.length(2);
      expect(dropContainer.find('.oneproviders-list-item.active')).to.exist;
      done();
    });
  });
});
