import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-step';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  tagName: 'li',
  classNames: ['one-step'],
  classNameBindings: ['isActive:active', 'isDone:done', 'stepNumberClassName'],

  index: null,
  title: null,

  /**
   * @override
   */
  i18nPrefix: 'components.oneStep',

  stepNumberClassName: computed('index', function () {
    return 'one-step-' + (this.get('index') + 1);
  }),

  displayedIndex: computed('index', function () {
    return this.get('index') + 1;
  }),
});
