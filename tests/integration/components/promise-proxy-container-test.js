import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import wait from 'ember-test-helpers/wait';

describe('Integration | Component | promise proxy container', function () {
  setupRenderingTest();

  it('renders error alert if promise has been rejected', async function (done) {
    let rejectReason = 'some reason';
    let fakeProxy = EmberObject.create({
      isSettled: true,
      ifFulfilled: false,
      isRejected: true,
      reason: rejectReason,
      content: 'some content',
    });

    this.set('proxy', fakeProxy);

    await render(hbs `{{#promise-proxy-container proxy=proxy}}some content{{/promise-proxy-container}}`);

    wait().then(() => {
      expect(this.$('.alert-promise-error')).to.have.length(1);
      done();
    });
  });

  it('shows error details when clicking on show details', async function (done) {
    let rejectReason = 'some reason';
    let fakeProxy = EmberObject.create({
      isSettled: true,
      ifFulfilled: false,
      isRejected: true,
      reason: rejectReason,
      content: 'some content',
    });

    this.set('proxy', fakeProxy);

    await render(hbs `{{#promise-proxy-container proxy=proxy}}some content{{/promise-proxy-container}}`);

    wait().then(() => {
      expect(
        this.$('a.promise-error-show-details'),
        'render show details switch'
      ).to.have.length(1);
      this.$('a.promise-error-show-details').click();
      wait().then(() => {
        expect(this.$('.error-details'), 'renders error details container')
          .to.have.length(1);
        expect(this.$('.error-details').text()).to.match(
          new RegExp(rejectReason)
        );
        done();
      });
    });
  });
});
