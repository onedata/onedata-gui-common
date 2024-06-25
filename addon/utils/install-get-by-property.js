/**
 * Adds a property with `newPropertyName` to the `emberObject` which will read a value
 * from the object using the `sourceObjectKey` from the `emberObject`.
 *
 * The value is evaluated by key using the `targetPath`, for example:
 *
 * ```
 * const emberObject = EmberObject.create({
 *   someObject: { foo: 1, bar: 2 },
 *   someProperty: 'foo',
 * });
 * installGetByProperty(emberObject, 'hello', 'someObject', 'someProperty');
 * ```
 *
 * will result adding a `hello` property to the emberObject that will be a `reads` to
 * `someObject.foo`, thus it will have an actual value of `1`.
 *
 * The `hello` property will be automatically updated to read the value of the other
 * property of `someObject` if `someProperty` will be changed.
 *
 * Note: this util adds an observer to the object, so remember to destroy the target
 * object.
 *
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { defineProperty } from '@ember/object';
import { reads } from '@ember/object/computed';

export default function installGetByProperty(
  emberObject,
  newPropertyName,
  sourceObjectKey,
  targetPath
) {
  const redefineFunctionName = `__${newPropertyName}Redefine`;
  const redefineProperty = function redefineProperty() {
    const path = this[targetPath];
    defineProperty(
      this,
      newPropertyName,
      reads(`${sourceObjectKey}.${path}`)
    );
  };
  emberObject[redefineFunctionName] = redefineProperty;
  emberObject[redefineFunctionName]();
  emberObject.addObserver(sourceObjectKey, emberObject, redefineFunctionName);
  emberObject.addObserver(targetPath, emberObject, redefineFunctionName);
  emberObject[redefineFunctionName]();
}
