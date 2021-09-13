/**
 * Created computed property which gets/sets an array and deserializes/serializes it
 * into `navigationState.aspectOptions` in form of string.
 *
 * @module utils/computed-aspect-options-array
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function computedAspectOptionsArray(propertyName) {
  const navigationStatePropertyPath = `navigationState.aspectOptions.${propertyName}`;
  return computed(`${navigationStatePropertyPath}.[]`, {
    get() {
      const rawSelected = this.get(navigationStatePropertyPath);
      console.log('rawSelected', rawSelected);
      return rawSelected && rawSelected.split(',') || [];
    },
    set(key, value) {
      this.get('navigationState').changeRouteAspectOptions({
        [propertyName]: value && value.join(',') || null,
      });
      return value;
    },
  });
}
