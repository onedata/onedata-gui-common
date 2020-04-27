import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { next } from '@ember/runloop';

describe('Integration | Component | one modal', function () {
  setupComponentTest('one-modal', {
    integration: true,
  });

  it(
    'calls onShown and onHidden when modal is closed before it was fully shown',
    function (done) {
      const shownSpy = sinon.spy();
      const hiddenSpy = sinon.spy();
      this.on('shown', shownSpy);
      this.on('hidden', hiddenSpy);

      this.render(hbs `
        {{#one-modal
          open=isModalOpened
          onShown=(action "shown")
          onHidden=(action "hidden")
          as |modal|}}
          {{#modal.body}}
            <div class="content">modal!</div>
          {{/modal.body}}
        {{/one-modal}}
      `);

      this.set('isModalOpened', true);

      next(this, () => {
        expect(shownSpy).to.not.be.called;
        expect(hiddenSpy).to.not.be.called;

        this.set('isModalOpened', false);
        wait().then(() => {
          expect(shownSpy).to.be.calledOnce;
          expect(hiddenSpy).to.be.calledOnce;
          done();
        });
      });
    }
  );

  it(
    'does not call "onHide", when closed using "open" property',
    function () {
      const hideSpy = sinon.spy();
      this.on('hide', hideSpy);

      this.render(hbs `
        {{#one-modal
          open=isModalOpened
          onHide=(action "hide")
          as |modal|}}
          {{#modal.body}}
            <div class="content">modal!</div>
          {{/modal.body}}
        {{/one-modal}}
      `);

      this.set('isModalOpened', true);

      return wait()
        .then(() => {
          this.set('isModalOpened', false);
          return wait();
        })
        .then(() => {
          expect(hideSpy).to.not.be.called;
        });
    }
  );

  it(
    'have auto-generated element id when id is not provided',
    function () {
      const hideSpy = sinon.spy();
      this.on('hide', hideSpy);

      this.render(hbs `{{one-modal class="my-modal"}}`);

      return wait()
        .then(() => {
          expect(this.$('.my-modal').attr('id')).to.match(/.*-modal/);
        });
    }
  );

  it(
    'uses id property as modal id when provided',
    function () {
      const hideSpy = sinon.spy();
      this.on('hide', hideSpy);

      this.render(hbs `{{one-modal id="some-id" class="my-modal"}}`);

      return wait()
        .then(() => {
          expect(this.$('.my-modal')).to.have.id('some-id');
        });
    }
  );
});
