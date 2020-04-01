import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { setProperties } from '@ember/object';
import { Promise, resolve, reject } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import wait from 'ember-test-helpers/wait';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';

describe('Integration | Component | form component/loading field', function () {
  setupComponentTest('form-component/loading-field', {
    integration: true,
  });

  beforeEach(function () {
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};

    this.set('field', LoadingField.create({
      ownerSource: this,
      loadingText: 'Loading...',
    }));
  });

  afterEach(function () {
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });

  it(
    'has class "loading-field"',
    function () {
      this.render(hbs `{{form-component/loading-field field=field}}`);

      expect(this.$('.loading-field')).to.exist;
    }
  );

  it(
    'shows spinner and loading text when loadingProxy is pending',
    function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: new Promise(() => {}),
      }));

      this.render(hbs `{{form-component/loading-field field=field}}`);

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
    function () {
      setProperties(this.get('field'), {
        loadingProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
        loadingText: undefined,
      });

      this.render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => {
          expect(this.$('.spin-spinner')).to.exist;
          expect(this.$('.loading-text')).to.not.exist;
        });
    }
  );

  it(
    'shows reasource load error when loadingProxy is rejected',
    function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: reject('err'),
      }));

      this.render(hbs `{{form-component/loading-field field=field}}`);

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
    function () {
      this.set('field.loadingProxy', PromiseObject.create({
        promise: resolve(),
      }));

      this.render(hbs `{{form-component/loading-field field=field}}`);

      return wait()
        .then(() => expect(this.$('.loading-field *')).to.not.exist);
    }
  );
});
