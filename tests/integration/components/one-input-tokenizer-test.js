import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one input tokenizer', function () {
  setupComponentTest('one-input-tokenizer', {
    integration: true
  });

  it('displays injected input text', function () {
    const inputText = 'hello world';
    this.set('inputText', inputText);

    this.render(hbs `{{one-input-tokenizer
      input=inputText
    }}`);

    return wait().then(() => {
      const $oneInputTokenizer = this.$('.one-input-tokenizer');
      expect($oneInputTokenizer).to.exist;
      expect($oneInputTokenizer.find('input').val())
        .to.equal(inputText);
    });
  });

  // TODO: complete this test - the input-tokenizer cannot tokenize full pasted lists
  // it('sends new tokens array after change', function () {
  //   const tokensChanged = sinon.spy();
  //   this.on('tokensChanged', tokensChanged);

  //   this.render(hbs `{{one-input-tokenizer
  //     tokensChanged=(action "tokensChanged")
  //   }}`);

  //   return wait().then(() => {
  //     const $oneInputTokenizer = this.$('.one-input-tokenizer');

  //     const inputEvent = new Event('input');
  //     inputEvent.which = 188;
  //     $oneInputTokenizer.val('hello')[0].dispatchEvent(inputEvent);

  //     expect(tokensChanged).to.be.calledOnce;
  //     expect(tokensChanged).to.be.calledWith(['hello']);
  //   });
  // });
});
