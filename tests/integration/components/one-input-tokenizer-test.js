import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import $ from 'jquery';

describe('Integration | Component | one input tokenizer', function () {
  setupRenderingTest();

  it('displays injected input text', async function () {
    const inputText = 'hello world';
    this.set('inputText', inputText);

    await render(hbs `{{one-input-tokenizer
      inputValue=inputText
    }}`);

    return wait().then(() => {
      const $oneInputTokenizer = this.$('.one-input-tokenizer');
      expect($oneInputTokenizer).to.exist;
      expect($oneInputTokenizer.find('input').val())
        .to.equal(inputText);
    });
  });

  it('sends new tokens array after change', async function () {
    const tokensChanged = sinon.spy();
    this.set('tokensChanged', tokensChanged);

    await render(hbs `{{one-input-tokenizer
      tokensChanged=(action tokensChanged)
      inputValue=inputValue
      inputValueChanged=(action (mut inputValue))
    }}`);

    return wait().then(() => {
      const $oneInputTokenizer = this.$('.one-input-tokenizer .tknz-input');

      const inputEvent = new $.Event('keypress');
      inputEvent.which = inputEvent.keyCode = 13;
      $oneInputTokenizer.val('hello');
      $oneInputTokenizer.trigger(inputEvent);

      return wait().then(() => {
        expect(tokensChanged).to.be.calledOnce;
        expect(tokensChanged).to.be.calledWith(['hello']);
      });
    });
  });
});
