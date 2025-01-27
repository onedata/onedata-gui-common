/**
 * Extends `ember-i18n` `t` helper by using translation prefix provided by passed
 * component object (which should implement `mixin:i18n` or have `locale` field of type
 * `Locale`).
 *
 * Implementation of JS file:
 *
 * - **Glimmer components and native-class classic component:** create `locale: Locale`
 *   property in component, follow exmple of `<Examples::OctaneExample>` and
 *   `<Examples::ClassicExample>` components,
 * - **classic Ember components:** extend classic component with `mixin:i18n` and set
 *   value of `i18nPrefix` property.
 *
 * For example, if the `i18nPrefix` is set to `someComponentName` and the HBS file looks
 * like:
 * ```
 * {{tt this "someKey" someInterpolation="some text"}}
 * ```
 * it will render translation for `components.someComponentName.someKey` with
 * `{someInterpolation: "some text"}` interpolation.
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import t from 'ember-i18n/helper';
import { typeOf } from '@ember/utils';
import { assert } from '@ember/debug';
import GlimmerComponent from '@glimmer/component';

export default t.extend({
  /**
   * Extends `ember-i18n` `t` helper. Uses translation prefix provided by passed
   * component.
   *
   * @param {Ember.Object} owner A classic Ember.Component that uses `mixin:i18n` or
   *   Glimmer component with `locale` initialized (`Locale` class).
   * @param {string} key Specific key of translation - will be appended to `tPrefix` of
   *    component
   * @param {object} contextObject For original `t` helper.
   * @returns {SafeString}
   */
  compute([owner, key, contextObject], interpolations) {
    const type = typeOf(owner);
    let tOwner;
    if (type === 'instance' || owner instanceof GlimmerComponent) {
      tOwner = owner.locale ?? owner;
      if (tOwner?.i18nPrefix) {
        return this._super(
          [
            tOwner.tPrefix + key,
            contextObject,
          ],
          interpolations,
        );
      } else {
        assert(
          'helper:tt: component should have i18nPrefix defined (only classic components) or have "locale" property (either classic or Glimmer)'
        );
      }
    } else {
      assert('helper:tt: first argument should be set to parent component');
    }
  },
});
