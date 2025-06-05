import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { next } from '@ember/runloop';
import { Promise } from 'rsvp';
import overrideComponents from 'onedata-gui-common/utils/override-components';

describe('Integration | Component | one-modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    overrideComponents(this.owner);
  });

  it('calls onShown and onHidden when modal is closed before it was fully shown',
    async function () {
      const shownSpy = sinon.spy();
      const hiddenSpy = sinon.spy();
      this.set('shown', shownSpy);
      this.set('hidden', hiddenSpy);

      await render(hbs `
        <OneModal
          @open={{isModalOpened}}
          @onShown={{action shown}}
          @onHidden={{action hidden}}
          as |modal|
        >
          <modal.body>
            <div class="content">modal!</div>
          </modal.body>
        </OneModal>
      `);

      this.set('isModalOpened', true);
      // Using next to let any Ember observers fire. It should be still not
      // enough time to render modal completely.
      await (new Promise((resolve) => next(this, resolve)));
      expect(shownSpy).to.not.be.called;
      expect(hiddenSpy).to.not.be.called;

      this.set('isModalOpened', false);
      await settled();
      expect(shownSpy).to.be.calledOnce;
      expect(hiddenSpy).to.be.calledOnce;
    }
  );

  it('does not call "onHide", when closed using "open" property',
    async function () {
      const hideSpy = sinon.spy();
      this.set('hide', hideSpy);

      await render(hbs `
        <OneModal @open={{isModalOpened}} @onHide={{action hide}} as |modal|>
          <modal.body>
            <div class="content">modal!</div>
          </modal.body>
        </OneModal>
      `);

      this.set('isModalOpened', true);
      await settled();
      this.set('isModalOpened', false);
      await settled();

      expect(hideSpy).to.not.be.called;
    }
  );

  it('have auto-generated element id when id is not provided',
    async function () {
      const hideSpy = sinon.spy();
      this.set('hide', hideSpy);

      await render(hbs `<OneModal @modalClass="my-modal" />`);

      expect(find('.my-modal').id).to.match(/.*-modal/);
    }
  );

  it('uses @modalId property as modal id when provided',
    async function () {
      const hideSpy = sinon.spy();
      this.set('hide', hideSpy);

      await render(hbs `<OneModal @modalId="some-id" @modalClass="my-modal" />`);

      expect(find('.my-modal').id).to.equal('some-id');
    }
  );
});
