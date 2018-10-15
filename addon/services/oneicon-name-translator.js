/**
 * A service that translates string pair (context, keyword) into valid oneicon
 * icon name. If (context, keyword) is not defined, then keyword is used as the
 * result.
 * 
 * It is created as a service to allow extending with custom names mapping.
 *
 * @module services/oneicon-name-translator
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

const namesDictionary = {
  group: {
    role_holders: 'role-holders',
  },
};

export default Service.extend({
  namesDictionary,

  getName(context, keyword) {
    const name = this.get(`namesDictionary.${context}.${keyword}`);
    return name || keyword;
  },
});
