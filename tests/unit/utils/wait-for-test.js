import { expect } from 'chai';
import { describe, it } from 'mocha';
import waitFor from 'onedata-gui-common/utils/wait-for';

describe('Unit | Utility | wait for', function (done) {
  // Replace this with your real tests.
  it('can wait for some function to return truth', function () {
    let count = 5;

    let tryFunc = () => {
      count -= 1;
      return count <= 0;
    };

    waitFor(tryFunc, {
      resolve: done,
      reject: () => expect(false, 'reject to not be invoked').to.be.ok
    });
  });
});
