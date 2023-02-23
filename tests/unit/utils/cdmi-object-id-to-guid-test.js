import { expect } from 'chai';
import { describe, it } from 'mocha';
import cdmiObjectIdToGuid from 'onedata-gui-common/utils/cdmi-object-id-to-guid';

describe('Unit | Utility | cdmi-object-id-to-guid', function () {
  it('converts cdmi object id to file guid', function () {
    const guid =
      'Z3VpZCNlMmY3NjVkYTMyOWMyMGNiYjU5MGE1NGViM2E3MTMyZCM4Mzk4MjE5ZWMwZTIyNjA0NWNkN2Q4NmMyOTgwNDEwYQ';
    const cdmiObjectId =
      '000000000046600A67756964236532663736356461333239633230636262353930613534656233613731333264233833393832313965633065323236303435636437643836633239383034313061';

    const result = cdmiObjectIdToGuid(cdmiObjectId);

    expect(result).to.equal(guid);
  });
});
