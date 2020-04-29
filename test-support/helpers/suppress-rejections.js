import { beforeEach, afterEach } from 'mocha';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';

export default function suppressRejections() {
  beforeEach(function () {
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};
  });

  afterEach(function () {
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });
}
