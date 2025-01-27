/**
 * Example of Glimmer Ember component that inherits from other component, that uses:
 * - override of Locale class (replacement for i18n mixin)
 *
 * Only for testing/learning/development purposes!
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Locale from 'onedata-gui-common/utils/locale';
import OctaneExampleComponent from './octane-example';

export default class OctaneExampleChildComponent extends OctaneExampleComponent {
  // The short way of defining locale - but it always instantiate the Locale class when it
  // would be overriden and it would be overwritten by mistake (this.locale = ...).
  locale = new Locale('components.examples.octaneExampleChild');
}
