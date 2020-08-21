import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject, { get } from '@ember/object';
import computedCurrentUserSpacePrivileges from 'onedata-gui-common/utils/computed-current-user-space-privileges';

describe('Unit | Utility | computed current user space privileges', function () {
  beforeEach(function () {
    this.flags = ['space_view_transfers', 'space_view_qos', 'space_view'];
  });

  it(
    'sets eff privileges flags to true and other to false if current user is not an owner',
    function () {
      const obj = EmberObject.extend({
        currentUserEffPrivileges: Object.freeze(['space_view_qos']),
        currentUserIsOwner: false,
        privileges: computedCurrentUserSpacePrivileges(this.flags),
      }).create();

      const privileges = get(obj, 'privileges');

      expect(privileges).to.have.property('viewTransfers', false);
      expect(privileges).to.have.property('viewQos', true);
      expect(privileges).to.have.property('view', false);
    }
  );

  it('sets all eff privileges flags to true if current user is an owner', function () {
    const obj = EmberObject.extend({
      currentUserEffPrivileges: Object.freeze(['space_view_qos']),
      currentUserIsOwner: true,
      privileges: computedCurrentUserSpacePrivileges(this.flags),
    }).create();

    const privileges = get(obj, 'privileges');

    expect(privileges).to.have.property('viewTransfers', true);
    expect(privileges).to.have.property('viewQos', true);
    expect(privileges).to.have.property('view', true);
  });
});
