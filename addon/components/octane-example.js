import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';

export default class OctaneExampleComponent extends Component {
  @computed()
  get locale() {
    return new Locale('components.octaneExample');
  }

  get textBar() {
    return this.locale.t('bar');
  }
}
