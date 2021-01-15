import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import getErrorDescription from 'onedata-gui-common/utils/get-error-description';
import sinon from 'sinon';
import { htmlSafe } from '@ember/string';
import Ember from 'ember';

describe('Unit | Utility | get error description', function () {
  beforeEach(function () {
    this.i18n = new I18nStub();
  });

  it('handles errors in form { id, details }', function () {
    const errorDetails = { a: 1 };
    const testTranslation = 'translation';
    sinon.stub(this.i18n, 't')
      .withArgs('errors.backendErrors.someError', errorDetails)
      .returns(testTranslation);
    const error = {
      id: 'someError',
      details: errorDetails,
    };

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: escapedHtmlSafe(testTranslation),
      errorJsonString: escapedJsonHtmlSafe(error),
    });
  });

  it('handles errors in form { id, details } when id is not recognized', function () {
    const errorDetails = { a: 1 };
    sinon.stub(this.i18n, 't')
      .withArgs('errors.backendErrors.someError', errorDetails)
      .returns('<missing-...');
    const error = {
      id: 'someError',
      details: errorDetails,
    };

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: undefined,
      errorJsonString: escapedJsonHtmlSafe(error),
    });
  });

  it('handles errors in form { id, details } when JSON cannot be stringified',
    function () {
      const testTranslation = 'translation';
      const error = {
        id: 'someError',
        details: {},
      };
      // Circular structure which cannot be stringified
      error.details = error;
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.someError', error.details)
        .returns(testTranslation);

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe(testTranslation),
        errorJsonString: undefined,
      });
    });

  it('handles errors in form { message }', function () {
    const error = { message: 'someError' };

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: escapedHtmlSafe(error.message),
      errorJsonString: undefined,
    });
  });

  it('handles errors inside htmlSafe', function () {
    const testTranslation = 'translation';
    const error = htmlSafe(testTranslation);

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: escapedHtmlSafe(testTranslation),
      errorJsonString: undefined,
    });
  });

  it('handles non-standard object errors', function () {
    const error = { err: 'error' };

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: undefined,
      errorJsonString: escapedJsonHtmlSafe(error),
    });
  });

  it('handles non-standard object errors with circular relations', function () {
    const error = {};
    error.err = error;

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: undefined,
      errorJsonString: undefined,
    });
  });

  it('handles errors in form { id, details } with id == "posix"', function () {
    sinon.stub(this.i18n, 't')
      .withArgs('errors.backendErrors.posix', { errno: 'enoent error' })
      .returns('complete enoent error')
      .withArgs('errors.backendErrors.translationParts.posixErrno.enoent')
      .returns('enoent error');
    const error = {
      id: 'posix',
      details: { errno: 'enoent' },
    };

    const result = getErrorDescription(error, this.i18n);

    expect(result).to.deep.equal({
      message: escapedHtmlSafe('complete enoent error'),
      errorJsonString: escapedJsonHtmlSafe(error),
    });
  });

  it(
    'handles errors in form { id, details } with id == "posix" and unknown errno',
    function () {
      const error = {
        id: 'posix',
        details: { errno: 'something' },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: undefined,
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  [
    'badServiceToken',
    'badConsumerToken',
    'badValueToken',
  ].forEach(errorId => {
    it(`handles errors in form { id, details } with id == "${errorId}"`,
      function () {
        const nestedErrorDetails = {
          limit: 120,
        };
        const nestedError = {
          id: 'tokenTooLarge',
          details: nestedErrorDetails,
        };
        sinon.stub(this.i18n, 't')
          .withArgs(
            `errors.backendErrors.${errorId}`,
            sinon.match({ tokenError: 'token too large' })
          ).returns('complete error')
          .withArgs(
            'errors.backendErrors.tokenTooLarge',
            nestedErrorDetails
          ).returns('token too large');
        const error = {
          id: errorId,
          details: {
            tokenError: nestedError,
          },
        };

        const result = getErrorDescription(error, this.i18n);

        expect(result).to.deep.equal({
          message: escapedHtmlSafe('complete error'),
          errorJsonString: escapedJsonHtmlSafe(error),
        });
      });
  });

  it(
    'handles errors in form { id, details } with id == "notAnAccessToken" and received with "accessToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnAccessToken',
          sinon.match({ received: 'access token' })
        ).returns('complete error');
      stubAccessTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnAccessToken',
        details: {
          received: {
            accessToken: {},
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnAccessToken" and received with "identityToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnAccessToken',
          sinon.match({ received: 'identity token' })
        ).returns('complete error');
      stubIdentityTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnAccessToken',
        details: {
          received: {
            identityToken: {},
          },
        },
      };
      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnAccessToken" and received with "inviteToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnAccessToken',
          sinon.match({ received: 'userJoinSpace invite token' })
        ).returns('complete error');
      stubInviteTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnAccessToken',
        details: {
          received: {
            inviteToken: {
              inviteType: 'userJoinSpace',
            },
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnIdentityToken" and received with "accessToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnIdentityToken',
          sinon.match({ received: 'access token' })
        ).returns('complete error');
      stubAccessTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnIdentityToken',
        details: {
          received: {
            accessToken: {},
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnIdentityToken" and received with "inviteToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnIdentityToken',
          sinon.match({ received: 'userJoinSpace invite token' })
        ).returns('complete error');
      stubInviteTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnIdentityToken',
        details: {
          received: {
            inviteToken: {
              inviteType: 'userJoinSpace',
            },
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnInviteToken", expected with "userJoinSpace" and received with "inviteToken" "groupJoinSpace"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnInviteToken',
          sinon.match({
            expectedInviteType: 'userJoinSpace',
            received: 'groupJoinSpace invite token',
          })
        ).returns('complete error');
      // stubAccessTokenTypeTranslation(tStub);
      stubInviteTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnInviteToken',
        details: {
          expectedInviteType: 'userJoinSpace',
          received: {
            inviteToken: {
              inviteType: 'groupJoinSpace',
            },
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnInviteToken", expected with "userJoinSpace" and received with "accessToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnInviteToken',
          sinon.match({
            expectedInviteType: 'userJoinSpace',
            received: 'access token',
          })
        ).returns('complete error');
      stubAccessTokenTypeTranslation(tStub);
      stubInviteTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnInviteToken',
        details: {
          expectedInviteType: 'userJoinSpace',
          received: {
            accessToken: {},
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "notAnInviteToken", expected with "userJoinSpace" and received with "identityToken"',
    function () {
      const tStub = sinon.stub(this.i18n, 't')
        .withArgs(
          'errors.backendErrors.notAnInviteToken',
          sinon.match({
            expectedInviteType: 'userJoinSpace',
            received: 'identity token',
          })
        ).returns('complete error');
      stubIdentityTokenTypeTranslation(tStub);
      stubInviteTokenTypeTranslation(tStub);
      const error = {
        id: 'notAnInviteToken',
        details: {
          expectedInviteType: 'userJoinSpace',
          received: {
            identityToken: {},
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  [{
    id: 'tokenServiceForbidden',
    resourceFieldName: 'service',
  }, {
    id: 'inviteTokenConsumerInvalid',
    resourceFieldName: 'consumer',
  }].forEach(({ id, resourceFieldName }) => {
    it(
      `handles errors in form { id, details } with id == "${id}"`,
      function () {
        sinon.stub(this.i18n, 't')
          .withArgs(`errors.backendErrors.${id}`, {
            [resourceFieldName]: 'user:123',
          }).returns('complete error');
        const error = {
          id,
          details: {
            [resourceFieldName]: {
              type: 'user',
              id: '123',
            },
          },
        };

        const result = getErrorDescription(error, this.i18n);

        expect(result).to.deep.equal({
          message: escapedHtmlSafe('complete error'),
          errorJsonString: escapedJsonHtmlSafe(error),
        });
      }
    );
  });

  it(
    'handles errors in form { id, details } with id == "fileAccess"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.fileAccess', {
          path: '/some/path',
          errno: 'eaccess error',
        })
        .returns('complete error')
        .withArgs('errors.backendErrors.translationParts.posixErrno.eaccess')
        .returns('eaccess error');
      const error = {
        id: 'fileAccess',
        details: {
          path: '/some/path',
          errno: 'eaccess',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "storageTestFailed"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.storageTestFailed', {
          operation: 'write translation',
        })
        .returns('complete error')
        .withArgs('errors.backendErrors.translationParts.storageTestOperations.write')
        .returns('write translation');
      const error = {
        id: 'storageTestFailed',
        details: {
          operation: 'write',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "fileAllocation"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.fileAllocation', {
          actualSize: '1 MiB',
          targetSize: '2 MiB',
        })
        .returns('complete error');
      const error = {
        id: 'fileAllocation',
        details: {
          actualSize: 1 * 1024 * 1024,
          targetSize: 2 * 1024 * 1024,
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "nodeNotCompatible"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.nodeNotCompatible', {
          hostname: 'host',
          clusterType: 'Onezone',
        })
        .returns('complete error');
      const error = {
        id: 'nodeNotCompatible',
        details: {
          hostname: 'host',
          clusterType: 'onezone',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "errorOnNodes"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.errorOnNodes', {
          hostnames: ['host'],
          error: 'some suberror',
        })
        .returns('complete error')
        .withArgs('errors.backendErrors.noConnectionToNewNode', {
          hostname: 'otherhost',
        })
        .returns('some suberror');
      const error = {
        id: 'errorOnNodes',
        details: {
          hostnames: ['host'],
          error: {
            id: 'noConnectionToNewNode',
            details: {
              hostname: 'otherhost',
            },
          },
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "noServiceNodes"',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.noServiceNodes', {
          service: 'database',
        })
        .returns('complete error')
        .withArgs('errors.backendErrors.translationParts.nodeServices.couchbase')
        .returns('database');
      const error = {
        id: 'noServiceNodes',
        details: {
          service: 'couchbase',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  [{
    errorId: 'requiresPosixCompatibleStorage',
    arraysInDetails: ['posixCompatibleStorages'],
  }, {
    errorId: 'autoStorageImportNotSupported',
    arraysInDetails: ['supportedStorages', 'supportedObjectStorages'],
  }, {
    errorId: 'fileRegistrationNotSupported',
    arraysInDetails: ['objectStorages'],
  }].forEach(({ errorId, arraysInDetails }) => {
    it(`handles errors in form { id, details } with id == "${errorId}"`,
      function () {
        const details = arraysInDetails.reduce((details, arrayName) => {
          details[arrayName] = [`${arrayName}0`, `${arrayName}1`];
          return details;
        }, {});
        const convertedDetails = arraysInDetails.reduce((details, arrayName) => {
          details[arrayName] = `${arrayName}0, ${arrayName}1`;
          return details;
        }, {});
        sinon.stub(this.i18n, 't')
          .withArgs(
            `errors.backendErrors.${errorId}`,
            sinon.match(convertedDetails)
          ).returns('complete error');
        const error = {
          id: errorId,
          details,
        };

        const result = getErrorDescription(error, this.i18n);

        expect(result).to.deep.equal({
          message: escapedHtmlSafe('complete error'),
          errorJsonString: escapedJsonHtmlSafe(error),
        });
      });
  });

  it(
    'handles errors in form { id, details } with id == "badData" and no hint',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.badData', {
          key: 'somekey',
          endingWithHint: '.',
        })
        .returns('complete error');
      const error = {
        id: 'badData',
        details: {
          key: 'somekey',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );

  it(
    'handles errors in form { id, details } with id == "badData" and hint',
    function () {
      sinon.stub(this.i18n, 't')
        .withArgs('errors.backendErrors.badData', {
          key: 'somekey',
          hint: 'somehint',
          endingWithHint: ': somehint.',
        })
        .returns('complete error');
      const error = {
        id: 'badData',
        details: {
          key: 'somekey',
          hint: 'somehint',
        },
      };

      const result = getErrorDescription(error, this.i18n);

      expect(result).to.deep.equal({
        message: escapedHtmlSafe('complete error'),
        errorJsonString: escapedJsonHtmlSafe(error),
      });
    }
  );
});

function stubInviteTokenTypeTranslation(tStub) {
  return tStub
    .withArgs('errors.backendErrors.translationParts.inviteToken')
    .returns('invite token');
}

function stubIdentityTokenTypeTranslation(tStub) {
  return tStub
    .withArgs('errors.backendErrors.translationParts.identityToken')
    .returns('identity token');
}

function stubAccessTokenTypeTranslation(tStub) {
  return tStub
    .withArgs('errors.backendErrors.translationParts.accessToken')
    .returns('access token');
}

function escapedHtmlSafe(content) {
  return htmlSafe(Ember.Handlebars.Utils.escapeExpression(content));
}

function escapedJsonHtmlSafe(content) {
  const stringifiedJson = JSON.stringify(content, null, 2);
  return htmlSafe(
    `<code>${Ember.Handlebars.Utils.escapeExpression(stringifiedJson)}</code>`
  );
}

class I18nStub {
  t() {}
}
