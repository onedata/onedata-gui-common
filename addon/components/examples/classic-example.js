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
