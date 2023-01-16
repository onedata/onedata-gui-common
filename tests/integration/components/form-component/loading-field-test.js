import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { setProperties } from '@ember/object';
import { Promise, resolve, reject } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { suppressRejections } from '../../../helpers/suppress-rejections';

describe('Integration | Component | form component/loading field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', LoadingField.create({
      ownerSource: this.owner,
      loadingText: 'Loading...',
    }));
  });

  it(
    'has class "loading-field"',
    async function () {
      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(find('.loading-field')).to.exist;
    }
  );

  it(
    'shows spinner and loading text when loadingProxy is pending',
    async function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: new Promise(() => {}),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(find('.spin-spinner')).to.exist;
      expect(find('.loading-text').textContent.trim()).to.equal('Loading...');
      expect(find('.resource-load-error')).to.not.exist;
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

      expect(find('.spin-spinner')).to.exist;
      expect(find('.loading-text')).to.not.exist;
    }
  );

  it(
    'shows reasource load error when loadingProxy is rejected',
    async function () {
      suppressRejections();
      this.set('field.loadingProxy', PromiseObject.create({
        promise: reject('err'),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(find('.resource-load-error')).to.exist;
      expect(find('.resource-load-error .error-details').textContent.trim())
        .to.equal('err');
    }
  );

  it(
    'does not show anything when loadingProxy is fulfilled',
    async function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: resolve(),
      }));

      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(find('.loading-field *')).to.not.exist;
    }
  );

  [
    ['md', 'xs'],
    ['sm', 'xxs'],
  ].forEach(([size, spinnerClass]) => {
    it(`uses "${spinnerClass}" spinner size for "${size}" field size`, async function () {
      setProperties(this.get('field'), {
        loadingProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
        size: size,
      });

      await render(hbs `{{form-component/loading-field field=field}}`);

      expect(find('.spinner-container')).to.have.class(spinnerClass);
    });
  });
});
