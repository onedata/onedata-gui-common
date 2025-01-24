import { computed } from '@ember/object';
import Locale from '../utils/locale';
import OctaneExampleComponent from './octane-example';

export default class OctaneExampleChildComponent extends OctaneExampleComponent {
  /** @override */
  @computed()
  get locale() {
    return new Locale('components.octaneExampleChild');
  }
}
