import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

const OneiconNameTranslatorStub = Service.extend({
  getName(context, keyword) {
    return keyword;
  },
});

describe('Integration | Helper | oneicon name translator', function () {
  setupComponentTest('oneicon-name-translator', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'oneicon-name-translator', OneiconNameTranslatorStub);
  });

  it('translates keyword into name', function () {
    const translatorService = lookupService(this, 'oneicon-name-translator');
    const spy = sinon.spy(translatorService, 'getName');

    const context = 'example-context';
    const keyword = 'example-keyword';
    this.setProperties({
      context,
      keyword,
    });

    this.render(hbs `{{oneicon-name-translator context keyword}}`);

    expect(this.$().text().trim()).to.equal(keyword);
    expect(spy).to.be.calledOnce;
    expect(spy).to.be.calledWith(context, keyword);
  });
});
