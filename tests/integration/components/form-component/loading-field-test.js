import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { setProperties } from '@ember/object';
import { Promise, resolve, reject } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../../helpers/suppress-rejections';

describe('Integration | Component | form component/loading field', function () {
  const hooks = setupRenderingTest();

  suppressRejections(hooks);

  hooks.beforeEach(function () {
    this.set('field', LoadingField.create({
      ownerSource: this.owner,
      loadingText: 'Loading...',
    }));
  });

  it(
    'has class "loading-field"',
    async function () {
      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(this.$('.loading-field')).to.exist;
    }
  );

  it(
    'shows spinner and loading text when loadingProxy is pending',
    async function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: new Promise(() => {}),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => {
          expect(this.$('.spin-spinner')).to.exist;
          expect(this.$('.loading-text').text().trim()).to.equal('Loading...');
          expect(this.$('.resource-load-error')).to.not.exist;
        });
    }
  );

  it(
    'shows only spinner when loadingProxy is pending and loading text is undefined',
    async function () {
      setProperties(this.get('field'), {
        loadingProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
        loadingText: undefined,
      });

      await render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => {
          expect(this.$('.spin-spinner')).to.exist;
          expect(this.$('.loading-text')).to.not.exist;
        });
    }
  );

  it(
    'shows reasource load error when loadingProxy is rejected',
    async function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: reject('err'),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => {
          expect(this.$('.resource-load-error')).to.exist;
          expect(this.$('.resource-load-error .error-details').text().trim())
            .to.equal('"err"');
        });
    }
  );

  it(
    'does not show anything when loadingProxy is fulfilled',
    async function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: resolve(),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => expect(this.$('.loading-field *')).to.not.exist);
    }
  );
});
