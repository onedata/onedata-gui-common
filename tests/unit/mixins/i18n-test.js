import EmberObject, { get } from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import I18nMixin from 'onedata-gui-common/mixins/i18n';
import sinon from 'sinon';

const i18nStub = EmberObject.extend({
  t(key) {
    return `_${key}_`;
  },
});

describe('Unit | Mixin | i18n', function () {
  it('adds t method to an object that uses i18n service and prefix', function () {
    const I18nObject = EmberObject.extend(I18nMixin, {
      i18n: i18nStub.create(),
      i18nPrefix: 'object.test.',
    });
    const subject = I18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_object.test.someKey_');
  });

  it('supports prefix without dot on end', function () {
    const I18nObject = EmberObject.extend(I18nMixin, {
      i18n: i18nStub.create(),
      i18nPrefix: 'object.test1',
    });
    const subject = I18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_object.test1.someKey_');
  });

  it('supports lack of prefix', function () {
    const I18nObject = EmberObject.extend(I18nMixin, {
      i18n: i18nStub.create(),
    });
    const subject = I18nObject.create();

    const text = subject.t('someKey');

    expect(text).to.equal('_someKey_');
  });

  it(
    'does not use i18n prefix to resolve translation path when option usePrefix is false',
    function () {
      const I18nObject = EmberObject.extend(I18nMixin, {
        i18n: i18nStub.create(),
        i18nPrefix: 'object.test.',
      });
      const subject = I18nObject.create();
      sinon.stub(get(subject, 'i18n'), 't')
        .withArgs('someKey')
        .returns('translation');

      const text = subject.t('someKey', {}, { usePrefix: false });

      expect(text).to.equal('translation');
    }
  );

  it(
    'returns default value from t() if translation was not found and defaultValue option is defined',
    function () {
      const I18nObject = EmberObject.extend(I18nMixin, {
        i18n: i18nStub.create(),
      });
      const subject = I18nObject.create();
      sinon.stub(get(subject, 'i18n'), 't')
        .withArgs('someKey')
        .returns('<missing-en: someKey>');

      const text = subject.t('someKey', {}, { defaultValue: 'defaultText' });

      expect(text).to.equal('defaultText');
    }
  );

  it(
    'returns missing translation from t() if translation was not found and defaultValue option is undefined',
    function () {
      const I18nObject = EmberObject.extend(I18nMixin, {
        i18n: i18nStub.create(),
      });
      const subject = I18nObject.create();
      sinon.stub(get(subject, 'i18n'), 't')
        .withArgs('someKey')
        .returns('<missing-en: someKey>');

      const text = subject.t('someKey', {}, { defaultValue: undefined });

      expect(text).to.equal('<missing-en: someKey>');
    }
  );
});
