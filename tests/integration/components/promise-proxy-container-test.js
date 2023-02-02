import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | promise proxy container', function () {
  setupRenderingTest();

  it('renders error alert if promise has been rejected', async function () {
    const rejectReason = 'some reason';
    const fakeProxy = EmberObject.create({
      isSettled: true,
      ifFulfilled: false,
      isRejected: true,
      reason: rejectReason,
      content: 'some content',
    });

    this.set('proxy', fakeProxy);

    await render(hbs `{{#promise-proxy-container proxy=proxy}}some content{{/promise-proxy-container}}`);

    expect(findAll('.alert-promise-error')).to.have.length(1);
  });

  it('shows error details when clicking on show details', async function () {
    const rejectReason = 'some reason';
    const fakeProxy = EmberObject.create({
      isSettled: true,
      ifFulfilled: false,
      isRejected: true,
      reason: rejectReason,
      content: 'some content',
    });

    this.set('proxy', fakeProxy);

    await render(hbs `{{#promise-proxy-container proxy=proxy}}some content{{/promise-proxy-container}}`);

    expect(
      findAll('a.promise-error-show-details'),
      'render show details switch'
    ).to.have.length(1);

    await click('a.promise-error-show-details');
    expect(findAll('.error-details'), 'renders error details container')
      .to.have.length(1);
    expect(find('.error-details').textContent).to.match(
      new RegExp(rejectReason)
    );
  });
});
