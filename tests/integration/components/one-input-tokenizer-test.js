import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, triggerKeyEvent } from '@ember/test-helpers';
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

    const $oneInputTokenizer = this.$('.one-input-tokenizer');
    expect($oneInputTokenizer).to.exist;
    expect($oneInputTokenizer.find('input').val())
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

    const $oneInputTokenizer = this.$('.one-input-tokenizer .tknz-input');
    await fillIn($oneInputTokenizer[0], 'hello');
    await triggerKeyEvent($oneInputTokenizer[0], 'keypress', 'Enter');

    expect(tokensChanged).to.be.calledOnce;
    expect(tokensChanged).to.be.calledWith(['hello']);
  });
});
