import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-ul-container';
import ContentOverFlowdetector from 'onedata-gui-common/mixins/content-overflow-detector';
import { computed } from '@ember/object';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(ContentOverFlowdetector, {
  layout,
  classNames: ['tab-bar-ul-container', 'bs-tab-onedata', 'bs-tab-modern'],
  classNameBindings: [
    'hasOverflow:tabs-overflowing',
    'scrollLeftReached:scroll-left-reached',
    'scrollRightReached:scroll-right-reached',
  ],

  // FIXME: remove?
  arrowDeltaIncrement: 4,

  scrollLeftReached: true,

  scrollRightReached: false,

  /**
   * @override
   */
  overflowElement: computed('element', function overflowElement() {
    return this.$('.tab-bar-ul');
  }),

  $scrollContent: computed('element', function $scrollContent() {
    return this.$('.container-inner-scroll-content');
  }),

  didInsertElement() {
    this._super(...arguments);
    const $scrollContent = this.get('$scrollContent')
    const self = this;
    this.addOverflowDetectionListener();
    const _overflowDetectorListener = this.get('_overflowDetectionListener')
    this.get('_overflowDetectionListener')();
    this.get('_window').addEventListener('resize', _overflowDetectorListener);
    $scrollContent.scroll(function onScrollContent() {
      return self.scrollContentScrolled($(this));
    });
    this.scrollContentScrolled($scrollContent)
  },

  willDestroyElement() {
    this._super(...arguments);
    const _overflowDetectorListener = this.get('_overflowDetectionListener')
    this.get('_window').removeEventListener('resize', _overflowDetectorListener);
    this.removeOverflowDetectionListener();
  },

  wheel(wheelEvent) {
    const originalEvent = wheelEvent.originalEvent;
    const { deltaX, deltaY } = originalEvent;
    if (deltaX === 0 && deltaY !== 0) {
      originalEvent.preventDefault();
      this.scrollContainer(deltaY);
    }
  },

  scrollContentScrolled(jqElement) {
    const scrollLeftReached = (jqElement.scrollLeft() === 0);
    const scrollRightReached =
      jqElement.scrollLeft() + jqElement.innerWidth() >= jqElement[0].scrollWidth;
    safeExec(this, 'setProperties', {
      scrollLeftReached,
      scrollRightReached,
    });
  },

  scrollContainer(delta) {
    const $scrollContent = this.get('$scrollContent');
    $scrollContent.scrollLeft($scrollContent.scrollLeft() + delta);
  },

  actions: {
    moveTabs(direction, moveDelta) {
      const right = (direction === 'right');
      this.scrollContainer((right ? 1 : -1) * moveDelta);
    }
  },
});
