import Locale from 'onedata-gui-common/utils/locale';
import OctaneExampleComponent from './octane-example';

export default class OctaneExampleChildComponent extends OctaneExampleComponent {
  // The short way of defining locale - but it always instantiate the Locale class when it
  // would be overriden and it would be overwritten by mistake (this.locale = ...).
  locale = new Locale('components.examples.octaneExampleChild');
}
