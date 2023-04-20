import EmberObject from '@ember/object';
import { htmlSafe } from '@ember/string';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ContentOverflowDetectorMixin from 'onedata-gui-common/mixins/content-overflow-detector';
import globals from 'onedata-gui-common/utils/globals';

const PARENT_WIDTH = 1000;
const ELEMENT_WIDTH = 500;
const SIBLING_WIDTH = 300;

describe('Integration | Mixin | content-overflow-detector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('parentStyle', htmlSafe(`width: ${PARENT_WIDTH}px;`));
    this.set('elementStyle', htmlSafe(
      `width: ${ELEMENT_WIDTH}px; display: inline-block;`));
    this.set('siblingStyle', htmlSafe(
      `width: ${SIBLING_WIDTH}px; display: inline-block;`));
    globals.mock('window', {
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

  it('detects overflow', async function () {
    const ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    const subject = ContentOverflowDetectorObject.create();

    await render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowElement', find('.testElement'));
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

  it('takes additionalOverflowMargin into account', async function () {
    const ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    const subject = ContentOverflowDetectorObject.create();

    await render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowElement', find('.testElement'));
    subject.set('additionalOverflowMargin', 300);
    subject.addOverflowDetectionListener();
    try {
      expect(subject.get('hasOverflow'),
        'detects, that there is an overflow').to.be.true;
    } finally {
      subject.removeOverflowDetectionListener();
    }
  });

  it('reacts to window resize', async function () {
    const ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    const subject = ContentOverflowDetectorObject.create();

    await render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowDetectionDelay', 0);
    subject.set('overflowElement', find('.testElement'));
    subject.addOverflowDetectionListener();
    this.set('elementStyle', htmlSafe(this.get('elementStyle').toString() +
      ` width: ${PARENT_WIDTH - SIBLING_WIDTH + 50}px;`));
    globals.window.resizeListener.call(null);
    await settled();
    try {
      expect(subject.get('hasOverflow'),
        'detects, that there is an overflow').to.be.true;
      subject.removeOverflowDetectionListener();
      expect(globals.window.resizeListener, 'removes event listener').to.be.null;
    } finally {
      subject.removeOverflowDetectionListener();
    }
  });

  it('takes minimumFullWindowSize into account', async function () {
    const ContentOverflowDetectorObject =
      EmberObject.extend(ContentOverflowDetectorMixin);
    const subject = ContentOverflowDetectorObject.create();

    await render(hbs `
      <div class="parent" style={{parentStyle}}>
        <div class="sibling" style={{siblingStyle}}></div>
        <div class="testElement" style={{elementStyle}}></div>
      </div>`);

    subject.set('overflowDetectionDelay', 0);
    subject.set('overflowElement', find('.testElement'));
    subject.set('minimumFullWindowSize', PARENT_WIDTH * 2);
    globals.window.innerWidth = PARENT_WIDTH * 1.5;
    subject.addOverflowDetectionListener();
    globals.window.resizeListener.call(null);
    await settled();
    try {
      expect(subject.get('hasOverflow'),
        'detects, that window is smaller than breakpoint width').to.be.true;
    } finally {
      subject.removeOverflowDetectionListener();
    }
  });
});
