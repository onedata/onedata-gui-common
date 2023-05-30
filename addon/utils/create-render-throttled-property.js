/**
 * Creates a property with specified `renderablePropertyName` which value is updated
 * automatically to the value of `propertyPath` in the `object` once for a render.
 * It is useful when the original property (specific by `propertyPath`) is updated
 * more than once for a render and this could cause "twice render modification" error.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  get,
  set,
} from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

/**
 * @param {EmberObject} object
 * @param {string} propertyPath
 * @param {string} renderablePropertyName
 */
export default function createRenderThrottledProperty(
  object,
  propertyPath,
  renderablePropertyName
) {
  if (!propertyPath || !renderablePropertyName) {
    throw new Error(
      'renderModificationProtected: propertyName and renderablePropertyName must not be empty'
    );
  }
  const updateRenderableProperty = function updateRenderableProperty() {
    set(object, renderablePropertyName, get(object, propertyPath));
  };
  updateRenderableProperty();
  object.addObserver(propertyPath, this, () => {
    scheduleOnce('afterRender', updateRenderableProperty);
  });
  // activate observer
  get(object, propertyPath);
}
