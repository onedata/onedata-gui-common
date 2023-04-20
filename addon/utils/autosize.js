// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */

/**
 * Ported from https://github.com/jackmoore/autosize as don't want to use globals
 * and npm import doesn't work in Ember for this package.
 *
 * Version: 4.0.2
 *
 * The MIT License(MIT)
 * Copyright(c) 2015 Jack Moore
 *
 * @author Jack Moore, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

const map = new Map();

let createEvent = (name) => new Event(name, { bubbles: true });
try {
  new Event('test');
} catch (e) {
  // IE does not support `new Event()`
  createEvent = (name) => {
    const evt = globals.document.createEvent('Event');
    evt.initEvent(name, true, false);
    return evt;
  };
}

function assign(ta) {
  if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) {
    return;
  }

  let heightOffset = null;
  let clientWidth = null;
  let cachedHeight = null;

  function init() {
    const style = globals.window.getComputedStyle(ta, null);

    if (style.resize === 'vertical') {
      ta.style.resize = 'none';
    } else if (style.resize === 'both') {
      ta.style.resize = 'horizontal';
    }

    if (style.boxSizing === 'content-box') {
      heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
    } else {
      heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    }
    // Fix when a textarea is not on document body and heightOffset is Not a Number
    if (isNaN(heightOffset)) {
      heightOffset = 0;
    }

    update();
  }

  function changeOverflow(value) {
    {
      // Chrome/Safari-specific fix:
      // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
      // made available by removing the scrollbar. The following forces the necessary text reflow.
      const width = ta.style.width;
      ta.style.width = '0px';
      // Force reflow:
      /* jshint ignore:start */
      ta.offsetWidth;
      /* jshint ignore:end */
      ta.style.width = width;
    }

    ta.style.overflowY = value;
  }

  function getParentOverflows(el) {
    const arr = [];

    while (el && el.parentNode && el.parentNode instanceof Element) {
      if (el.parentNode.scrollTop) {
        arr.push({
          node: el.parentNode,
          scrollTop: el.parentNode.scrollTop,
        });
      }
      el = el.parentNode;
    }

    return arr;
  }

  function resize() {
    if (ta.scrollHeight === 0) {
      // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
      return;
    }

    const overflows = getParentOverflows(ta);
    const docTop = globals.document.documentElement && globals.document.documentElement
      .scrollTop; // Needed for Mobile IE (ticket #240)

    ta.style.height = '';
    ta.style.height = (ta.scrollHeight + heightOffset) + 'px';

    // used to check if an update is actually necessary on window.resize
    clientWidth = ta.clientWidth;

    // prevents scroll-position jumping
    overflows.forEach(el => {
      el.node.scrollTop = el.scrollTop;
    });

    if (docTop) {
      globals.document.documentElement.scrollTop = docTop;
    }
  }

  function update() {
    resize();

    const styleHeight = Math.round(parseFloat(ta.style.height));
    const computed = globals.window.getComputedStyle(ta, null);

    // Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
    let actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta
      .offsetHeight;

    // The actual height not matching the style height (set via the resize method) indicates that
    // the max-height has been exceeded, in which case the overflow should be allowed.
    if (actualHeight < styleHeight) {
      if (computed.overflowY === 'hidden') {
        changeOverflow('scroll');
        resize();
        actualHeight = computed.boxSizing === 'content-box' ?
          Math.round(parseFloat(globals.window.getComputedStyle(ta, null).height)) :
          ta.offsetHeight;
      }
    } else {
      // Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
      if (computed.overflowY !== 'hidden') {
        changeOverflow('hidden');
        resize();
        actualHeight = computed.boxSizing === 'content-box' ?
          Math.round(parseFloat(globals.window.getComputedStyle(ta, null).height)) :
          ta.offsetHeight;
      }
    }

    if (cachedHeight !== actualHeight) {
      cachedHeight = actualHeight;
      const evt = createEvent('autosize:resized');
      try {
        ta.dispatchEvent(evt);
      } catch (err) {
        // Firefox will throw an error on dispatchEvent for a detached element
        // https://bugzilla.mozilla.org/show_bug.cgi?id=889376
      }
    }
  }

  const pageResize = () => {
    if (ta.clientWidth !== clientWidth) {
      update();
    }
  };

  const destroy = (style => {
    globals.window.removeEventListener('resize', pageResize, false);
    ta.removeEventListener('input', update, false);
    ta.removeEventListener('keyup', update, false);
    ta.removeEventListener('autosize:destroy', destroy, false);
    ta.removeEventListener('autosize:update', update, false);

    Object.keys(style).forEach(key => {
      ta.style[key] = style[key];
    });

    map.delete(ta);
  }).bind(ta, {
    height: ta.style.height,
    resize: ta.style.resize,
    overflowY: ta.style.overflowY,
    overflowX: ta.style.overflowX,
    wordWrap: ta.style.wordWrap,
  });

  ta.addEventListener('autosize:destroy', destroy, false);

  // IE9 does not fire onpropertychange or oninput for deletions,
  // so binding to onkeyup to catch most of those events.
  // There is no way that I know of to detect something like 'cut' in IE9.
  if ('onpropertychange' in ta && 'oninput' in ta) {
    ta.addEventListener('keyup', update, false);
  }

  globals.window.addEventListener('resize', pageResize, false);
  ta.addEventListener('input', update, false);
  ta.addEventListener('autosize:update', update, false);
  ta.style.overflowX = 'hidden';
  ta.style.wordWrap = 'break-word';

  map.set(ta, {
    destroy,
    update,
  });

  init();
}

function destroy(ta) {
  const methods = map.get(ta);
  if (methods) {
    methods.destroy();
  }
}

function update(ta) {
  const methods = map.get(ta);
  if (methods) {
    methods.update();
  }
}

let autosize = null;

// Do nothing in Node.js environment and IE8 (or lower)
if (typeof globals.window === 'undefined' || typeof globals.window.getComputedStyle !== 'function') {
  autosize = el => el;
  autosize.destroy = el => el;
  autosize.update = el => el;
} else {
  autosize = (el, options) => {
    if (el) {
      Array.prototype.forEach.call(el.length ? el : [el], x => assign(x, options));
    }
    return el;
  };
  autosize.destroy = el => {
    if (el) {
      Array.prototype.forEach.call(el.length ? el : [el], destroy);
    }
    return el;
  };
  autosize.update = el => {
    if (el) {
      Array.prototype.forEach.call(el.length ? el : [el], update);
    }
    return el;
  };
}

export default autosize;
