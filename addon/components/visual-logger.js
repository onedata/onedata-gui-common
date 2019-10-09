import Component from '@ember/component';
import layout from '../templates/components/visual-logger';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  classNames: ['visual-logger'],

  visualLogger: service(),
});
