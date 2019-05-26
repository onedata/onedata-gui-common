import { expect } from 'chai';
import { describe, it } from 'mocha';
import getErrorDescription from 'onedata-gui-common/utils/get-error-description';

const REST_EXAMPLE_1 = {
  "error": "Service Error",
  "description": "Action 'modify_details' for a service 'oneprovider' terminated with an error.",
  "module": "service_oneprovider",
  "function": "obtain_webcert",
  "hosts": {
    "dev-oneprovider-krakow-node-1-0.dev-oneprovider-krakow.default.svc.cluster.local": {
      "error": "Internal Error",
      "description": "Server encountered an unexpected error."
    }
  }
};

describe('Unit | Utility | get error description', function () {
  it('gets simple description from REST errors', function () {
    const error = {
      response: {
        body: REST_EXAMPLE_1,
      }
    };

    const result = getErrorDescription(error);

    expect(result.message).to.match(/^Server encountered an unexpected error.$/);
  });
});
