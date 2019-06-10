import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach
} from 'mocha';
import { initialize } from 'onedata-gui-common/initializers/fetch-config';
import Application from '@ember/application';
import { run } from '@ember/runloop';

describe('Unit | Helper | fetch config initializer', function () {
  let application;

  beforeEach(function () {
    run(function () {
      application = Application.create();
      application.deferReadiness();
    });
  });

  it('adds a getOnedataConfig method to application', function () {
    initialize(application);

    expect(typeof (application.getOnedataConfig)).to.be.equal('function');
  });

  it(
    'creates application.getOnedataConfig method which resolves with an object',
    function () {
      initialize(application);

      let configPromise = application.getOnedataConfig('/');

      return configPromise.then(config => {
        expect(typeof (config)).to.be.equal('object');
      }).catch(() => {
        expect(false, 'getOnedataConfig promise rejected').to.be.ok;
      });
    }
  );
});
