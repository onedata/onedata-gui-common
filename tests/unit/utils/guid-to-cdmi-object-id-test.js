import { expect } from 'chai';
import { describe, it } from 'mocha';
import guidToCdmiObjectId from 'onedata-gui-common/utils/guid-to-cdmi-object-id';

describe('Unit | Utility | guid to cdmi object id', function () {
  it('converts file guid to cdmi object id', function () {
    const guid =
      'Z3VpZCNlMmY3NjVkYTMyOWMyMGNiYjU5MGE1NGViM2E3MTMyZCM4Mzk4MjE5ZWMwZTIyNjA0NWNkN2Q4NmMyOTgwNDEwYQ';
    const cdmiObjectId =
      '000000000046600A67756964236532663736356461333239633230636262353930613534656233613731333264233833393832313965633065323236303435636437643836633239383034313061';

    const result = guidToCdmiObjectId(guid);

    expect(result).to.equal(cdmiObjectId);
  });
});
