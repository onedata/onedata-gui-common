import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | resource load error', function () {
  setupRenderingTest();

  it('renders show details button if reason is provided', async function () {
    await render(hbs `{{resource-load-error reason="some reason"}}`);
    expect(findAll('.promise-error-show-details')).to.have.length(1);
  });

  it('does not renders show details button if reason is not provided', async function () {
    await render(hbs `{{resource-load-error}}`);
    expect(find('.promise-error-show-details')).to.not.exist;
  });

  it('renders custom message if provided', async function () {
    let message = 'some message';
    this.set('message', message);
    await render(hbs `{{resource-load-error message=message}}`);
    expect(this.element.textContent).to.match(new RegExp(message));
  });

  it('displays error string if an error is plain string', async function () {
    let reason = 'some reason';
    this.set('reason', reason);
    await render(hbs `{{resource-load-error reason=reason}}`);
    expect(this.element.textContent).to.match(new RegExp(reason));
  });

  it('gets description of error when it\'s a response error type ', async function () {
    let description = 'some description';
    let reason = {
      response: {
        body: {
          description,
        },
      },
    };
    this.set('reason', reason);
    await render(hbs `{{resource-load-error reason=reason}}`);
    expect(this.element.textContent).to.match(new RegExp(description));
  });
});
