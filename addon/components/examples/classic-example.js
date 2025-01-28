/**
 * Example of classic Ember component written as native ES class that uses:
 * - ember-decorators
 * - Locale class (replacement for i18n mixin)
 *
 * Only for testing/learning/development purposes!
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import template from 'onedata-gui-common/templates/components/examples/classic-example';
import { classNames, layout } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Locale from 'onedata-gui-common/utils/locale';

@layout(template)
@classNames('classic-example')
export default class ClassicExampleComponent extends Component {
  locale = new Locale('components.examples.classicExample');

  @computed
  get barText() {
    return this.locale.t('bar');
  }
}
