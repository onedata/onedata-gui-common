import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import $ from 'jquery';

describe('Integration | Component | one input tokenizer', function () {
  setupComponentTest('one-input-tokenizer', {
    integration: true
  });

  it('displays injected input text', function () {
    const inputText = 'hello world';
    this.set('inputText', inputText);

    this.render(hbs `{{one-input-tokenizer
      inputValue=inputText
    }}`);

    return wait().then(() => {
      const $oneInputTokenizer = this.$('.one-input-tokenizer');
      expect($oneInputTokenizer).to.exist;
      expect($oneInputTokenizer.find('input').val())
        .to.equal(inputText);
    });
  });

  it('sends new tokens array after change', function () {
    const tokensChanged = sinon.spy();
    this.on('tokensChanged', tokensChanged);

    this.render(hbs `{{one-input-tokenizer
      tokensChanged=(action "tokensChanged")
      inputValue=inputValue
      inputValueChanged=(action (mut inputValue))
    }}`);

    return wait().then(() => {
      const $oneInputTokenizer = this.$('.one-input-tokenizer .tknz-input');

      const inputEvent = new $.Event('keypress');
      inputEvent.which = inputEvent.keyCode = 13;
      $oneInputTokenizer.val('hello')
      $oneInputTokenizer.trigger(inputEvent);

      return wait().then(() => {
        expect(tokensChanged).to.be.calledOnce;
        expect(tokensChanged).to.be.calledWith(['hello']);
      });
    });
  });
});
