/**
 * Created computed property which gets/sets an array and deserializes/serializes it
 * into `navigationState.aspectOptions` in form of string.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';

export default function computedAspectOptionsArray(propertyName) {
  const navigationStatePropertyPath = `navigationState.aspectOptions.${propertyName}`;
  return computed(navigationStatePropertyPath, {
    get() {
      const rawSelected = this.get(navigationStatePropertyPath);
      return rawSelected && rawSelected.split(',') || [];
    },
    set(key, value) {
      this.get('navigationState').changeRouteAspectOptions({
        [propertyName]: !isEmpty(value) && isArray(value) && value.join(',') || null,
      });
      return value;
    },
  });
}
