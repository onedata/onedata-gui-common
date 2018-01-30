import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import I18n from '../../helpers/i18n-stub';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

const testAspect = 'testAspect';

const i18nTranslations = {
  tabs: {
    spaces: {
      aspects: {
        testAspect: 'test aspect',
      },
    }
  },
};

const I18nStub = I18n.extend({
  translations: i18nTranslations,
});

const testSidebarAction = 'testAction';
const SidebarResourcesStub = Service.extend({
  getButtonsFor() {
    return [{
      title: testSidebarAction,
    }];
  }
});

const aspectActions = [{
  title: 'testAspectAction',
}];

const resourceName = 'testName';
const ContentResourcesStub = Service.extend({
  getModelFor() {
    return resolve(EmberObject.create({
      id: '1',
      name: resourceName,
    }))
  },
});

const RouterStub = Service.extend({
  targetState: undefined,

  init() {
    this._super(...arguments);
    this.set('targetState', EmberObject.create({
      routerJsState: EmberObject.create({
        params: {},
      }),
    }));
  },

  setRouteParam(path, paramName, value) {
    const params = this.get('targetState.routerJsState.params');
    if (!params[path]) {
      params[path] = {};
    }
    params[path][paramName] = value;
  }
});

const MediaStub = Service.extend({
  isTablet: false,
});

describe('Unit | Service | navigation state', function () {
  setupTest('service:navigation-state', {});

  beforeEach(function () {
      registerService(this, 'i18n', I18nStub);
      registerService(this, 'sidebar-resources', SidebarResourcesStub);
      registerService(this, 'content-resources', ContentResourcesStub);
      registerService(this, 'router', RouterStub);
      registerService(this, 'media', MediaStub);
    }),

    it('detects sidebar content level', function () {
      const service = this.subject();
      const router = lookupService(this, 'router');
      router.set('currentRouteName', 'onedata.sidebar.index');
      expect(service.get('activeContentLevel')).to.equal('sidebar');
    });

  it('detects contentIndex content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    expect(service.get('activeContentLevel')).to.equal('contentIndex');
  });

  it('detects index content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      'index'
    );
    expect(service.get('activeContentLevel')).to.equal('index');
  });

  it('detects aspect content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      testAspect
    );
    expect(service.get('activeContentLevel')).to.equal('aspect');
  });

  it('detects resource type', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    expect(service.get('activeResourceType')).to.equal('spaces');
  });

  it('gets resource', function (done) {
    const service = this.subject();

    const contentResources = lookupService(this, 'content-resources');
    const getModelForSpy = sinon.spy(contentResources, 'getModelFor');

    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      '1'
    );

    service.get('activeResource');
    expect(getModelForSpy).to.be.calledWith('spaces', '1');
    wait().then(() => {
      expect(service.get('activeResource.id')).to.equal('1');
      done();
    })
  });

  it('detects aspect', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      testAspect
    );
    expect(service.get('activeAspect')).to.equal(testAspect);
  });

  it('prepares global bar title for sidebar content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    expect(service.get('globalBarActiveTitle')).to.equal('spaces');
  });

  it('prepares global bar title for contentIndex level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      undefined
    );
    expect(service.get('globalBarActiveTitle')).to.equal('spaces');
  });

  it('prepares global bar title for index level', function (done) {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      '1'
    );
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      'index'
    );
    service.get('globalBarActiveTitle');
    wait().then(() => {
      expect(service.get('globalBarActiveTitle')).to.equal(resourceName);
      done();
    });
  });

  it('prepares global bar title for aspect content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      '1'
    );
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      testAspect
    );
    expect(service.get('globalBarActiveTitle'))
      .to.equal(i18nTranslations.tabs.spaces.aspects.testAspect);
  });

  it('prepares global actions for sidebar content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    const actions = service.get('globalMenuActions')
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(testSidebarAction);
  });

  it('prepares global actions for contentIndex content level', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      undefined
    );
    const actions = service.get('globalMenuActions')
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(testSidebarAction);
  });

  it('prepares global actions for aspect content level (mobile mode)', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      '1'
    );
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      testAspect
    );
    service.setProperties({
      aspectActions,
      aspectActionsTitle: 'space',
    });
    const actions = service.get('globalMenuActions')
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(aspectActions[0].title);
  });

  it('prepares global actions for aspect content level (tablet mode)', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    router.setRouteParam(
      'onedata.sidebar',
      'type',
      'spaces'
    );
    router.setRouteParam(
      'onedata.sidebar.content',
      'resourceId',
      '1'
    );
    router.setRouteParam(
      'onedata.sidebar.content.aspect',
      'aspectId',
      testAspect
    );
    const media = lookupService(this, 'media');
    media.set('isTablet', true);
    service.setProperties({
      aspectActions,
      aspectActionsTitle: 'space',
    });
    const actions = service.get('globalMenuActions')
    expect(actions).to.have.length(3);
    expect(actions[0].title).to.equal(testSidebarAction);
    expect(actions[1].title).to.equal('space');
    expect(actions[1].separator).to.be.true;
    expect(actions[2].title).to.equal(aspectActions[0].title);
  });
});
