import { expect } from 'chai';
import { describe, it } from 'mocha';
import privilegesArrayToObject from 'onedata-gui-common/utils/privileges-array-to-object';

// Example privileges
const groupedFlags = [{
  groupName: 'groupManagement',
  privileges: [
    { name: 'group_view' },
    { name: 'group_update' },
    { name: 'group_view_privileges' },
    { name: 'group_set_privileges' },
    { name: 'group_delete' },
  ],
}, {
  groupName: 'groupHierarchyManagement',
  privileges: [
    { name: 'group_add_child' },
    { name: 'group_remove_child' },
    { name: 'group_add_parent' },
    { name: 'group_leave_parent' },
  ],
}];

const flatFlags = groupedFlags
  .map(group => group.privileges)
  .reduce((all, groupPerms) => all.concat(groupPerms.mapBy('name')), []);

function getTreeSumedValue(tree, useAnd) {
  return Object.keys(tree).reduce((val, groupName) => {
    return Object.keys(tree[groupName]).reduce((inVal, privName) => {
      if (useAnd) {
        return inVal && tree[groupName][privName];
      } else {
        return inVal || tree[groupName][privName];
      }
    }, val);
  }, useAnd);
}

describe('Unit | Utility | privileges array to object', function () {
  it('marks privileges as true if available', function () {
    let result = privilegesArrayToObject(flatFlags, groupedFlags);
    expect(getTreeSumedValue(result, true)).to.be.true;
  });

  it('marks privileges as false if not available', function () {
    let result = privilegesArrayToObject([], groupedFlags);
    expect(getTreeSumedValue(result, false)).to.be.false;
  });
});
