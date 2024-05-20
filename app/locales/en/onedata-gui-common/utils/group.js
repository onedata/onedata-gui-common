import { GroupAttribute, GroupType } from 'onedata-gui-common/utils/group';

export default {
  attributes: {
    [GroupAttribute.GroupId]: 'ID',
    [GroupAttribute.Name]: 'Name',
    [GroupAttribute.Type]: 'Type',
  },
  types: {
    [GroupType.Organization]: 'Organization',
    [GroupType.Unit]: 'Unit',
    [GroupType.Team]: 'Team',
    [GroupType.RoleHolders]: 'Role holders',
  },
};
