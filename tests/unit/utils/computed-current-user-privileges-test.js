import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject, { get, set } from '@ember/object';
import computedCurrentUserPrivileges from 'onedata-gui-common/utils/computed-current-user-privileges';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | computed-current-user-privileges', function () {
  beforeEach(function () {
    this.flags = ['space_view_transfers', 'space_view_qos', 'space_view'];
  });

  it(
    'sets eff privileges flags to true and other to false if current user is not an owner',
    function () {
      const obj = EmberObject.extend({
        currentUserEffPrivileges: Object.freeze(['space_view_qos']),
        currentUserIsOwner: false,
        privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
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
      privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
    }).create();

    const privileges = get(obj, 'privileges');

    expect(privileges).to.have.property('viewTransfers', true);
    expect(privileges).to.have.property('viewQos', true);
    expect(privileges).to.have.property('view', true);
  });

  it(
    'sets eff privileges flags when using privileges other than space_*',
    function () {
      this.flags = ['group_update', 'group_add_child'];
      const obj = EmberObject.extend({
        currentUserEffPrivileges: Object.freeze(['group_add_child']),
        currentUserIsOwner: false,
        privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
      }).create();

      const privileges = get(obj, 'privileges');

      expect(privileges).to.have.property('update', false);
      expect(privileges).to.have.property('addChild', true);
    }
  );

  it(
    'can use other names of computed properties than default',
    function () {
      this.flags = ['space_view_qos'];
      const obj = EmberObject.extend({
        priv: Object.freeze(['space_view_qos']),
        own: false,
        privileges: computedCurrentUserPrivileges({
          allFlags: this.flags,
          effPrivilegesProperty: 'priv',
          isOwnerProperty: 'own',
        }),
      }).create();

      const privileges = get(obj, 'privileges');

      expect(privileges).to.have.property('viewQos', true);
    }
  );

  it('sets proper flags if owner property is not defined', function () {
    const obj = EmberObject.extend({
      currentUserEffPrivileges: Object.freeze(['space_view_qos']),
      privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
    }).create();

    const privileges = get(obj, 'privileges');

    expect(privileges).to.have.property('viewQos', true);
    expect(privileges).to.have.property('view', false);
  });

  it('changes when effective privileges array is changed', async function () {
    const obj = EmberObject.extend({
      currentUserEffPrivileges: Object.freeze(['space_view_qos']),
      currentUserIsOwner: false,
      privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
    }).create();

    const privilegesBefore = get(obj, 'privileges');

    expect(privilegesBefore).to.have.property('viewQos', true);
    expect(privilegesBefore).to.have.property('viewTransfers', false);

    set(obj, 'currentUserEffPrivileges', ['space_view_transfers']);
    await settled();
    const privilegesAfter = get(obj, 'privileges');
    expect(privilegesAfter).to.have.property('viewQos', false);
    expect(privilegesAfter).to.have.property('viewTransfers', true);
  });

  it('changes when owner flag is changed', async function () {
    const obj = EmberObject.extend({
      currentUserEffPrivileges: Object.freeze(['space_view_qos']),
      currentUserIsOwner: false,
      privileges: computedCurrentUserPrivileges({ allFlags: this.flags }),
    }).create();

    const privilegesBefore = get(obj, 'privileges');

    expect(privilegesBefore).to.have.property('viewTransfers', false);

    set(obj, 'currentUserIsOwner', true);
    await settled();
    const privilegesAfter = get(obj, 'privileges');
    expect(privilegesAfter).to.have.property('viewTransfers', true);
  });
});
