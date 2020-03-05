/**
 * Creates computed property that returns translation for given key. Key should
 * be compatible with one consumed by t() method from I18n mixin, thus I18n mixin
 * is needed.
 * 
 * @module utils/computed-t
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function computedT(translationName, interpolations) {
  return computed(function computedTFunction() {
    return this.t(translationName, interpolations);
  });
}
