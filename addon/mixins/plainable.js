// Original implementation: http://stackoverflow.com/a/15002755

import Ember from 'ember';
import plainCopy from 'onedata-gui-common/utils/plain-copy';

export default Ember.Mixin.create({
  plainCopy: function () {
    return plainCopy(this);
  },
});
