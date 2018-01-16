import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsI18nMixin from 'onedata-gui-common/mixins/components/i18n';

const i18nStub = Ember.Object.create({
  t(key) {
    return `_${key}_`;
  },
});

describe('Unit | Mixin | components/i18n', function () {

  it('adds t method to component that uses i18n service and prefix', function () {
    const ComponentsI18nObject = Ember.Object.extend(ComponentsI18nMixin, {
      i18n: i18nStub,
      i18nPrefix: 'component.test.',
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_component.test.someKey_');
  });

  it('supports prefix without dot on end', function () {
    const ComponentsI18nObject = Ember.Object.extend(ComponentsI18nMixin, {
      i18n: i18nStub,
      i18nPrefix: 'component.test1',
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_component.test1.someKey_');
  });

  it('supports lack of prefix', function () {
    const ComponentsI18nObject = Ember.Object.extend(ComponentsI18nMixin, {
      i18n: i18nStub,
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_someKey_');
  });

});
