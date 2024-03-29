import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-wizard';

export default Component.extend({
  layout,
  classNames: ['one-wizard'],
  classNameBindings: ['stepsNumClassName', 'activeStepClassName'],
  currentIndex: 0,

  steps: null,
  stepsNumClassName: computed('steps', function () {
    const steps = this.get('steps');
    let className = 'steps-';
    className += steps !== null ? steps.length : 0;
    return className;
  }),
  activeStepClassName: computed('currentIndex', function () {
    return 'step-active-' + (this.get('currentIndex') + 1);
  }),

  init() {
    this._super(...arguments);
  },

  currentStep: computed('steps.[]', 'currentIndex', function () {
    const {
      steps,
      currentIndex,
    } = this.getProperties('steps', 'currentIndex');

    return steps.objectAt(currentIndex);
  }),

  actions: {
    next() {
      this.incrementProperty('currentIndex');
    },
  },
});
