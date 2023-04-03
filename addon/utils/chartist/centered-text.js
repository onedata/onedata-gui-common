/**
 * Plugin for Chartist which adds additional text in the center of the chart.
 *
 * Options:
 * * text - text to display
 * * fontSize - [optional] text font size (percents will be relative
 *   to `min(chart.width, chart.height)`)
 * * maxWidth - [optional] max text width (in the same format as fontSize).
 *   If text width is greater than maxWidth, then font size is scaled down
 * * class - class for text svg element
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

const DEFAULT_FONT_SIZE = '10%';
const DEFAULT_MAX_WIDTH = '40%';

export default function centeredText(options) {
  const defaultOptions = {
    text: '',
    fontSize: DEFAULT_FONT_SIZE,
    maxWidth: DEFAULT_MAX_WIDTH,
    class: '',
  };
  _.defaults(options, defaultOptions);
  return (chart) => {
    chart.on('created', () => {
      const svg = chart.svg;
      const relativeSize = Math.min(svg.width(), svg.height());

      const fontSize =
        normalizeSize(options.fontSize, relativeSize, DEFAULT_FONT_SIZE);

      const textAttributes = {
        'dx': svg.width() / 2,
        'dy': svg.height() / 2,
        'text-anchor': 'middle',
        'style': `dominant-baseline: middle; font-size: ${fontSize}px`,
      };

      const textElement = svg.elem('text', textAttributes, 'ct-centered-text')
        .text(options.text);
      const textWidth = textElement.width();
      const maxTextWidth =
        normalizeSize(options.maxWidth, relativeSize, DEFAULT_MAX_WIDTH) - 10;
      if (textWidth > maxTextWidth) {
        const scaleRatio = maxTextWidth / textWidth;
        textElement.getNode().style.fontSize = fontSize * scaleRatio + 'px';
      }
      svg.append(textElement);
    });
  };
}

function normalizeSize(size, relativeSize, defaultValue) {
  let normalizedSize;
  if (typeof size === 'string') {
    normalizedSize = size.trim();
  } else if (typeof size === 'number') {
    return size;
  } else {
    if (typeof defaultValue === 'number') {
      return defaultValue;
    } else {
      normalizedSize = String(defaultValue);
    }
  }
  if (normalizedSize[normalizedSize.length - 1] === '%') {
    return relativeSize * (parseFloat(normalizedSize) / 100);
  } else {
    return parseFloat(normalizedSize);
  }
}
