import EmberObject, { get } from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import ComponentsI18nMixin from 'onedata-gui-common/mixins/components/i18n';
import sinon from 'sinon';

const i18nStub = EmberObject.extend({
  t(key) {
    return `_${key}_`;
  },
});

describe('Unit | Mixin | components/i18n', function () {

  it('adds t method to component that uses i18n service and prefix', function () {
    const ComponentsI18nObject = EmberObject.extend(ComponentsI18nMixin, {
      i18n: i18nStub.create(),
      i18nPrefix: 'component.test.',
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_component.test.someKey_');
  });

  it('supports prefix without dot on end', function () {
    const ComponentsI18nObject = EmberObject.extend(ComponentsI18nMixin, {
      i18n: i18nStub.create(),
      i18nPrefix: 'component.test1',
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_component.test1.someKey_');
  });

  it('supports lack of prefix', function () {
    const ComponentsI18nObject = EmberObject.extend(ComponentsI18nMixin, {
      i18n: i18nStub.create(),
    });
    const subject = ComponentsI18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_someKey_');
  });

  it(
    'returns translation from tWithDefault() if translation was found',
    function () {
      const ComponentsI18nObject = EmberObject.extend(ComponentsI18nMixin, {
        i18n: i18nStub.create(),
      });
      const subject = ComponentsI18nObject.create();
      sinon.stub(get(subject, 'i18n'), 't')
        .withArgs('someKey')
        .returns('abc');

      const text = subject.tWithDefault('someKey', {}, 'defaultText');

      expect(text).to.equal('abc');
    }
  );

  it(
    'returns default value from tWithDefault() if translation was not found',
    function () {
      const ComponentsI18nObject = EmberObject.extend(ComponentsI18nMixin, {
        i18n: i18nStub.create(),
      });
      const subject = ComponentsI18nObject.create();
      sinon.stub(get(subject, 'i18n'), 't')
        .withArgs('someKey')
        .returns('<missing-en: someKey>');

      const text = subject.tWithDefault('someKey', {}, 'defaultText');

      expect(text).to.equal('defaultText');
    }
  );
});
