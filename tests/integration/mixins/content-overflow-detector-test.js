import EmberObject from '@ember/object';
import { htmlSafe } from '@ember/string';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ContentOverflowDetectorMixin from 'onedata-gui-common/mixins/content-overflow-detector';

const PARENT_WIDTH = 1000;
const ELEMENT_WIDTH = 500;
const SIBLING_WIDTH = 300;

describe('Integration | Mixin | content overflow detector', function () {
  setupComponentTest('content-overflow-detector', {
    integration: true,
  });

  beforeEach(function () {
    this.set('parentStyle', htmlSafe(`width: ${PARENT_WIDTH}px;`));
    this.set('elementStyle', htmlSafe(
      `width: ${ELEMENT_WIDTH}px; display: inline-block;`));
    this.set('siblingStyle', htmlSafe(
      `width: ${SIBLING_WIDTH}px; display: inline-block;`));
    this.set('_window', {
      resizeListener: null,
      innerWidth: PARENT_WIDTH,
      addEventListener(event, listener) {
        this.resizeListener = listener;
      },
      removeEventListener() {
        this.resizeListener = null;
      },
    });
  });

  it('detects overflow', function () {
    let ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    let subject = ContentOverflowDetectorObject.create();

    this.render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowElement', this.$('.testElement'));
    subject.set('overflowDetectionDelay', 0);
    subject.addOverflowDetectionListener();
    try {
      expect(subject.get('hasOverflow'),
        'detects, that there is no overflow').to.be.false;
      this.set('elementStyle', htmlSafe(this.get('elementStyle').toString() +
        ` width: ${PARENT_WIDTH - SIBLING_WIDTH + 50}px;`));
      subject.detectOverflow();
      expect(subject.get('hasOverflow'),
        'detects, that there is an overflow').to.be.true;
    } finally {
      subject.removeOverflowDetectionListener();
    }
  });

  it('takes additionalOverflowMargin into account', function () {
    let ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    let subject = ContentOverflowDetectorObject.create();

    this.render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowElement', this.$('.testElement'));
    subject.set('additionalOverflowMargin', 300);
    subject.addOverflowDetectionListener();
    try {
      expect(subject.get('hasOverflow'),
        'detects, that there is an overflow').to.be.true;
    } finally {
      subject.removeOverflowDetectionListener();
    }
  });

  it('reacts to window resize', function (done) {
    let ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    let subject = ContentOverflowDetectorObject.create();

    this.render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    let _window = this.get('_window');
    subject.set('_window', _window);
    subject.set('overflowDetectionDelay', 0);
    subject.set('overflowElement', this.$('.testElement'));
    subject.addOverflowDetectionListener();
    this.set('elementStyle', htmlSafe(this.get('elementStyle').toString() +
      ` width: ${PARENT_WIDTH - SIBLING_WIDTH + 50}px;`));
    _window.resizeListener.call(null);
    wait().then(() => {
      try {
        expect(subject.get('hasOverflow'),
          'detects, that there is an overflow').to.be.true;
        subject.removeOverflowDetectionListener();
        expect(_window.resizeListener, 'removes event listener').to.be.null;
      } finally {
        subject.removeOverflowDetectionListener();
      }
      done();
    });
  });

  it('takes minimumFullWindowSize into account', function (done) {
    let ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    let subject = ContentOverflowDetectorObject.create();

    this.render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    let _window = this.get('_window');
    subject.set('_window', _window);
    subject.set('overflowDetectionDelay', 0);
    subject.set('overflowElement', this.$('.testElement'));
    subject.set('minimumFullWindowSize', PARENT_WIDTH * 2);
    _window.innerWidth = PARENT_WIDTH * 1.5;
    subject.addOverflowDetectionListener();
    _window.resizeListener.call(null);
    wait().then(() => {
      try {
        expect(subject.get('hasOverflow'),
          'detects, that window is smaller than breakpoint width').to.be.true;
      } finally {
        subject.removeOverflowDetectionListener();
      }
      done();
    });
  });
});
