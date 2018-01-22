import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-sidenav';
import PerfectScrollbar from 'npm:perfect-scrollbar';

// TODO debug PerfectScrollbar and consider using PerfectScrollbarMixin

/**
 * Based on: https://www.w3schools.com/howto/howto_js_sidenav.asp
 */
export default Component.extend({
  layout,
  classNames: ['one-sidenav', 'sidenav'],
  classNameBindings: ['isOpened:in'],
  attributeBindings: ['style'],

  eventsBus: service(),

  isOpened: false,

  style: htmlSafe(''),

  init() {
    this._super(...arguments);
    let eventsBus = this.get('eventsBus');

    eventsBus.on('one-sidenav:close', (selector) => {
      if (!selector || this.element.matches(selector)) {
        this.send('close');
      }
    });

    eventsBus.on('one-sidenav:open', (selector) => {
      if (!selector || this.element.matches(selector)) {
        this.send('open');
      }
    });
  },

  didInsertElement() {
    let coverSelector = this.get('coverSelector');
    scheduleOnce('afterRender', this, function () {
      this.set('$coverElement', $(coverSelector));
      $(window).on('resize.' + this.elementId, () => this.changeSize());
      this.changeSize();
    });
  },

  willDestroyElement() {
    $(window).off('.' + this.elementId);
  },

  updatePosition(open) {
    let $coverElement = this.get('$coverElement');
    let left = $coverElement.offset().left;
    let width = open ? $coverElement.width() : 0;
    this.set('style', htmlSafe(`left: ${left}px; width: ${width}px;`));
    this.$('.sidenav-content-container').width(width);
  },

  changeSize: observer('isOpened', function () {
    this.updatePosition(this.get('isOpened'));
  }),

  actions: {
    open() {
      this.set('isOpened', true);
      scheduleOnce(
        'afterRender',
        this,
        () => PerfectScrollbar.initialize(this.element)
      );
    },

    close() {
      this.set('isOpened', false);
      this.sendAction('closed');
      scheduleOnce(
        'afterRender',
        this,
        () => PerfectScrollbar.destroy(this.element)
      );
    }
  }

});
