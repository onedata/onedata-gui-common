import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';

const I18nStub = Service.extend({
  t() {},
});

describe('Integration | Helper | tt', function () {
  setupComponentTest('tt', {
    integration: true
  });

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
  });

  it('renders translated text', function () {
    const FakeComponent = EmberObject.extend(I18n);
    this.set('comp', FakeComponent.create({
      i18nPrefix: 'hello.world',
    }));
    const i18nService = lookupService(this, 'i18n');
    sinon.stub(i18nService, 't')
      .withArgs('hello.world.foo.bar')
      .returns('Two worlds');

    this.render(hbs `{{tt comp "foo.bar"}}`);

    expect(this.$().text().trim()).to.equal('Two worlds');
  });
});
