import Ember from 'ember';

const originalLoggerError = Ember.Logger.error;
const originalTestAdapterException = Ember.Test.adapter.exception;
const fakeLoggerError = function () {};
const fakeTestAdapterException = function () {};

export function suppressRejections() {
  Ember.Logger.error = fakeLoggerError;
  Ember.Test.adapter.exception = fakeTestAdapterException;
}

export function unsuppressRejections() {
  if (Ember.Logger.error === fakeLoggerError) {
    Ember.Logger.error = originalLoggerError;
  }
  if (Ember.Test.adapter.exception === fakeTestAdapterException) {
    Ember.Test.adapter.exception = originalTestAdapterException;
  }
}
