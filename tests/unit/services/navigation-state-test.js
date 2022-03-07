import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import I18n from '../../helpers/i18n-stub';
import Service from '@ember/service';
import EmberObject from '@ember/object';

const testAspect = 'testAspect';
const spacesItemName = 'Spaces Item';

const i18nTranslations = {
  tabs: {
    spaces: {
      menuItem: spacesItemName,
      aspects: {
        index: 'Index',
        testAspect: 'test aspect',
      },
    },
  },
};

const I18nStub = I18n.extend({
  translations: i18nTranslations,
});

const testSidebarAction = 'testAction';
const SidebarResourcesStub = Service.extend({
  getButtonsFor(type) {
    switch (type) {
      case 'spaces':
        return [{ title: testSidebarAction }];
      default:
        return [];
    }
  },
});

const aspectActions = [{
  title: 'testAspectAction',
}];

const resourceName = 'testName';
const resource = EmberObject.create({
  id: '1',
  name: resourceName,
});

const RouterStub = Service.extend({});

const MediaStub = Service.extend({
  isTablet: false,
});

describe('Unit | Service | navigation state', function () {
  setupTest();

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'sidebar-resources', SidebarResourcesStub);
    registerService(this, 'router', RouterStub);
    registerService(this, 'media', MediaStub);
  });

  it('detects sidebar content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    expect(service.get('activeContentLevel')).to.equal('sidebar');
  });

  it('detects contentIndex content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    expect(service.get('activeContentLevel')).to.equal('contentIndex');
  });

  it('detects index content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeAspect', 'index');
    expect(service.get('activeContentLevel')).to.equal('index');
  });

  it('detects aspect content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeAspect', testAspect);
    expect(service.get('activeContentLevel')).to.equal('aspect');
  });

  it('prepares global bar title for sidebar content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    service.set('activeResourceType', 'spaces');
    expect(service.get('globalBarActiveTitle')).to.equal(spacesItemName);
  });

  it('prepares global bar title for contentIndex level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    expect(service.get('globalBarActiveTitle')).to.equal(spacesItemName);
  });

  it('prepares global bar title for index level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    service.set('activeAspect', 'index');
    service.get('globalBarActiveTitle');
    expect(service.get('globalBarActiveTitle')).to.equal('Index');
  });

  it('prepares global bar title for aspect content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    service.set('activeAspect', testAspect);
    expect(service.get('globalBarActiveTitle'))
      .to.equal(i18nTranslations.tabs.spaces.aspects.testAspect);
  });

  it('prepares global actions for sidebar content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.index');
    service.set('activeResourceType', 'spaces');
    const actions = service.get('globalMenuActions');
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(testSidebarAction);
  });

  it('prepares global actions for contentIndex content level', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.index');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    const actions = service.get('globalMenuActions');
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(testSidebarAction);
  });

  it('prepares global actions for aspect content level (mobile mode)', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    service.set('activeAspect', testAspect);
    service.setProperties({
      aspectActions,
      aspectActionsTitle: 'space',
    });
    const actions = service.get('globalMenuActions');
    expect(actions).to.have.length(1);
    expect(actions[0].title).to.equal(aspectActions[0].title);
  });

  it('prepares global actions for aspect content level (tablet mode)', function () {
    const service = this.owner.lookup('service:navigation-state');
    const router = lookupService(this, 'router');
    router.set('currentRouteName', 'onedata.sidebar.content.aspect');
    service.set('activeResourceType', 'spaces');
    service.set('activeResource', resource);
    service.set('activeAspect', testAspect);
    const media = lookupService(this, 'media');
    media.set('isTablet', true);
    service.setProperties({
      aspectActions,
      aspectActionsTitle: 'space',
    });
    const actions = service.get('globalMenuActions');
    expect(actions).to.have.length(3);
    expect(actions[0].title).to.equal(testSidebarAction);
    expect(actions[1].title).to.equal('space');
    expect(actions[1].separator).to.be.true;
    expect(actions[2].title).to.equal(aspectActions[0].title);
  });
  
  it('parses aspect options with multiple dots', function () {
    const service = this.owner.lookup('service:navigation-state');
    service.set('aspectOptionsString', 'hello.world......other.value');
  });
});
