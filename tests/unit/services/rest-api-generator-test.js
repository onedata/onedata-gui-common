import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | rest api generator', function () {
  setupTest('service:rest-api-generator', {});

  it('generates curl command for rest sample', function () {
    const apiSample = {
      apiRoot: 'https://dev-onezone.default.svc.cluster.local/api/v3/onezone',
      swaggerOperationId: 'get_test_data',
      requiresAuthorization: false,
      placeholders: {},
      path: '/test/path/to/data',
      name: 'Get test data',
      description: 'Return test data',
      method: 'GET',
      followRedirects: true,
    };
    const service = this.subject();
    expect(service.generateSample(apiSample))
      .to.equal(
        'curl -L -X GET \'https://dev-onezone.default.svc.cluster.local/api/v3/onezone/test/path/to/data\''
      );
  });
});
