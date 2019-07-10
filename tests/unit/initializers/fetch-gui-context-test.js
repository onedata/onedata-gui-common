import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach
} from 'mocha';
import { initialize } from 'onedata-gui-common/initializers/fetch-gui-context';
import Application from '@ember/application';
import { run } from '@ember/runloop';

describe('Unit | Helper | fetch gui context initializer', function () {
  let application;

  beforeEach(function () {
    run(function () {
      application = Application.create();
      application.deferReadiness();
    });
  });

  it('adds a fetchGuiContext method to application', function () {
    initialize(application);

    expect(typeof (application.fetchGuiContext)).to.be.equal('function');
  });
});
