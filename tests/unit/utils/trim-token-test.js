import { expect } from 'chai';
import { describe, it } from 'mocha';
import trimToken from 'onedata-gui-common/utils/trim-token';

const correctToken =
  'MDAzM2xvY2F00aW9uIGRldi1vbmV6b25lLmRlZmF1bHQuc3ZjLmNsdXN00ZXIubG9jYWwKMDAzNmlkZW500aWZpZXIgNjU1NjUxOWNjYjY00MmJmZGNiZDliZWFkMTdjODBjNzFjaGJlNDgKMDAxYWNpZCB00aW1lIDwgMTYxMjg2MDQ5NwowMDJmc2lnbmF00dXJlIGmQBEaZEjxmYJjUlX5DcVCAK01S00unbxWZvU016RYdSXxCg';

describe('Unit | Utility | trim-token', function () {
  it('returns unchanged token when token is correct', function () {
    const trimmedToken = trimToken(correctToken);
    expect(trimmedToken).to.equal(correctToken);
  });

  it('returns null when null has been passed', function () {
    const trimmedToken = trimToken(null);
    expect(trimmedToken).to.be.null;
  });

  it('returns undefined when undefined has been passed', function () {
    const trimmedToken = trimToken(undefined);
    expect(trimmedToken).to.be.undefined;
  });

  it('returns empty string when empty string has been passed', function () {
    const trimmedToken = trimToken('');
    expect(trimmedToken).to.equal('');
  });

  it('returns token without preceding and trailing whitespaces', function () {
    const token = `  ${correctToken}  `;
    const trimmedToken = trimToken(token);
    expect(trimmedToken).to.equal(correctToken);
  });

  it('returns token without whitespaces inside token', function () {
    const token =
      `${correctToken.slice(0, 5)} ${correctToken.slice(5, 10)}  ${correctToken.slice(10)}`;
    const trimmedToken = trimToken(token);
    expect(trimmedToken).to.equal(correctToken);
  });

  it('returns token without special characters inside token', function () {
    const token =
      `%${correctToken.slice(0, 5)}#$${correctToken.slice(5, 10)}=.,ą${correctToken.slice(10)}`;
    const trimmedToken = trimToken(token);
    expect(trimmedToken).to.equal(correctToken);
  });
});
