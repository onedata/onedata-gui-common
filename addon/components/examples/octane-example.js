/**
 * Example of Glimmer Ember component that uses:
 * - Locale class (replacement for i18n mixin)
 *
 * Only for testing/learning/development purposes!
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';

export default class OctaneExampleComponent extends Component {
  // The long way of defining locale - it will not instantiate the Locale class when it
  // would be overriden in subclasses and it is read-only as an object property.
  @computed
  get locale() {
    return new Locale('components.examples.octaneExample');
  }

  get textBar() {
    return this.locale.t('bar');
  }
}
