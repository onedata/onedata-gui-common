import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

const oneiconAliasStub = Service.extend({
  getName(context, keyword) {
    return keyword;
  },
});

describe('Integration | Helper | oneicon name translator', function () {
  setupComponentTest('oneicon-alias', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'oneicon-alias', oneiconAliasStub);
  });

  it('translates keyword into name', function () {
    const translatorService = lookupService(this, 'oneicon-alias');
    const spy = sinon.spy(translatorService, 'getName');

    const context = 'example-context';
    const keyword = 'example-keyword';
    this.setProperties({
      context,
      keyword,
    });

    this.render(hbs `{{oneicon-alias context keyword}}`);

    expect(this.$().text().trim()).to.equal(keyword);
    expect(spy).to.be.calledOnce;
    expect(spy).to.be.calledWith(context, keyword);
  });
});
