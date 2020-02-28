/**
 * @module components/demo-components/tags-input
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tags: computed(function tags() {
    return [{
      label: 'tag1',
      icon: 'space',
    }, {
      label: 'tag2',
      icon: 'provider',
    }, {
      label: 'tag3',
    }, {
      label: 'tag4',
      icon: 'user',
    }];
  }),

  selectorSettings: computed('tags', function selectorSettings() {
    return {
      allowedTags: this.get('tags'),
    };
  }),
})
