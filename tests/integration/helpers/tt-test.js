import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';

const I18nStub = Service.extend({
  t() {},
});

describe('Integration | Helper | tt', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
  });

  it('renders translated text', async function () {
    const FakeComponent = EmberObject.extend(I18n);
    this.set('comp', FakeComponent.create({
      i18nPrefix: 'hello.world',
    }));
    const i18nService = lookupService(this, 'i18n');
    sinon.stub(i18nService, 't')
      .withArgs('hello.world.foo.bar')
      .returns('Two worlds');

    await render(hbs `{{tt comp "foo.bar"}}`);

    expect(this.element.textContent.trim()).to.equal('Two worlds');
  });
});
