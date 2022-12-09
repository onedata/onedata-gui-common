import dom from 'onedata-gui-common/utils/dom';

/**
 * Makes an element fixed positioned, with coordinates (left, top) of its parent.
 *
 * NOTE: ported from ember-cli-onedata-gui-common
 *
 * @param {HTMLElement} element An element which position will be computed in relation to "parent"
 * @param {object} [parent=element.parentElement] An element which will act as element position parent.
 *         If null or undefined - will use a element.parentElement.
 * @param {object} options Additional options to manipulate floater behaviour, properties:
 * @param {string} [options.posX=right] horizontal position of element relative to the parent, possible:
 *           - ``left`` - the element will be placed completely on left of the parent
 *           - ``right`` - the element will be placed completely on right of the parent
 * @param {string} [options.posY=top] vertical position of element relative to the parent, possible:
 *           - ``top`` - the element will be placed completely on top of the parent
 *           - ``top-above`` - same as ``top``
 *           - ``top-middle`` - the vertical middle of element will be placed on top of parent
 *           - ``middle`` - the vertical middle of element will be placed in the vertical middle of parent
 *           - ``middle-middle`` - same as ``middle``
 *           /middle - the floater (0,0) will position on top/middle of parent
 *               (default: top)
 * @param {integer} [options.offsetX=0] X offset of computed position in px
 * @param {integer} [options.offsetY=0] Y offset of computed position in px
 * @param {HTMLElement} [options.stackingContext] An element which is a stacking context
 *   - effectively it will be a relative parent, see: https://stackoverflow.com/a/25828495
 *
 * @returns {function} Function which re-computes new fixed position of an element.
 *             It should be bind to eg. parent mouseover.
 */
export default function bindFloater(
  element,
  parent = element.parentElement,
  options = {}
) {
  // default options
  options.posX = options.posX || 'right';
  options.posY = options.posY || 'top';
  options.offsetX = options.offsetX || 0;
  options.offsetY = options.offsetY || 0;

  element.classList.add('floater');
  const changePos = function () {
    const offset = dom.offset(parent);
    const parentWidth = dom.width(parent, dom.LayoutBox.ContentBox);
    const parentHeight = dom.height(parent, dom.LayoutBox.ContentBox);
    const elementWidth = dom.width(element, dom.LayoutBox.ContentBox);
    const elementHeight = dom.height(element, dom.LayoutBox.ContentBox);
    let left;
    if (options.posX === 'right') {
      left = parseInt(offset.left) + parentWidth;
    } else if (options.posX === 'left') {
      left = parseInt(offset.left) - elementWidth;
    } else if (options.posX === 'center') {
      left = parseInt(offset.left) + parentWidth / 2 - elementWidth / 2;
    }
    let top;
    if (options.posY === 'top' || options.posY === 'top-above') {
      top = offset.top;
    } else if (options.posY === 'top-middle') {
      top = parseInt(offset.top) - elementHeight / 2;
    } else if (options.posY === 'middle' || options.posY === 'middle-middle') {
      top = parseInt(offset.top) + parentHeight / 2 - elementHeight / 2;
    }

    const stackingContext = options.stackingContext;
    if (stackingContext) {
      const stackingOffset = dom.offset(stackingContext);
      left -= stackingOffset.left;
      top -= stackingOffset.top;
    }

    dom.setStyles(element, {
      left: `${left + options.offsetX - document.scrollingElement.scrollLeft}px`,
      top: `${top + options.offsetY + document.scrollingElement.scrollTop}px`,
    });
  };

  changePos();
  return changePos;
}
