import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, triggerKeyEvent, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | one input tokenizer', function () {
  setupRenderingTest();

  it('displays injected input text', async function () {
    const inputText = 'hello world';
    this.set('inputText', inputText);

    await render(hbs `{{one-input-tokenizer
      inputValue=inputText
    }}`);

    const oneInputTokenizer = find('.one-input-tokenizer');
    expect(oneInputTokenizer).to.exist;
    expect(oneInputTokenizer.querySelector('input').value)
      .to.equal(inputText);
  });

  it('sends new tokens array after change', async function () {
    const tokensChanged = sinon.spy();
    this.set('tokensChanged', tokensChanged);

    await render(hbs `{{one-input-tokenizer
      tokensChanged=(action tokensChanged)
      inputValue=inputValue
      inputValueChanged=(action (mut inputValue))
    }}`);

    const oneInputTokenizer = find('.one-input-tokenizer .tknz-input');
    await fillIn(oneInputTokenizer, 'hello');
    await triggerKeyEvent(oneInputTokenizer, 'keypress', 'Enter');

    expect(tokensChanged).to.be.calledOnce;
    expect(tokensChanged).to.be.calledWith(['hello']);
  });
});
