/**
 * Plugin for Chartist which changes chart elements styles to custom values
 * using data.customCss. It has to be a list with objects in format e.g.:
 * {
 *   slice: {
 *      'color': 'white',
 *   }
 * }
 * Name of an element is the same as the one we can obtain from data.type,
 * where `data` if from `chart.on('draw', (data) => {...})`. Styles are applied to
 * `data.element`.
 *
 * If transition is necessary, special object transitionProperties
 * can be used. It is a object with css properties and values,
 * that will be applied just after (in the next run-loop) standard
 * (not in transitionProperties) properties application. Example:
 * {
 *   slice: {
 *     'stroke-opacity': '0.5',
 *     transitionProperties: {
 *       'transition': 'stroke-opacity 0.4s',
 *       'stroke-opacity: '1',
 *     }
 *   }
 * }
 * Here first `'stroke-opacity': '0.5'` will be applied and then, in the next
 * run-loop, all properties from transitionProperties. In result we will see
 * stroke-opacity animation 0.5 to 1.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import dom from 'onedata-gui-common/utils/dom';

export default function customCss(options) {
  const defaultOptions = {
    filterBySeriesIndex: false,
  };
  const normalizedOptions = Chartist.extend({}, defaultOptions, options);
  return (chart) => {
    chart.on('draw', (data) => {
      let css = chart.data.customCss;
      if (normalizedOptions.filterBySeriesIndex) {
        css = css[data.seriesIndex];
      }
      const elementCss = css && css[data.index] && css[data.index][data.type];
      if (elementCss) {
        const element = data.element.getNode();
        const transitionProperties = elementCss.transitionProperties;
        delete elementCss.transitionProperties;
        dom.setStyles(element, elementCss);
        if (transitionProperties) {
          setTimeout(() => dom.setStyles(element, transitionProperties), 0);
        }
      }
    });
  };
}
