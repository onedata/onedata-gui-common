/**
 * @author Michał Borzęcki
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

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

  manyTags: computed(function manyTags() {
    return _.range(10).map(i => ({ icon: 'browser-attribute', label: `tag-${i}` }));
  }),

  selectorSettings: computed('tags', function selectorSettings() {
    return {
      allowedTags: this.get('tags'),
    };
  }),
});
