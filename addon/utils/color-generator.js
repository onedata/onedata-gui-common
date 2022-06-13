// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

/**
 * Class responsible for generating colors in a deterministic and idempotent way.
 * Idempotency of generating colors in guaranteed ONLY within calls to the
 * same generator instance.
 *
 * @module utils/color-generator
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Color from 'color';
import config from 'ember-get-config';

export default class ColorGenerator {
  /**
   * @public
   * @param {Array<string>} [baseColors] base colors for generator in HEX format
   */
  constructor(baseColors = Object.values(config.colors)) {
    /**
     * @private
     * @type {Array<string>}
     */
    this.baseColors = baseColors;

    /**
     * @private
     * @type {Map<unknown, string>}
     */
    this.generatedColorsForKeys = new Map();
  }

  /**
   * Generates an array of colors of a given size. The algorithm of calculating
   * colors is idempotent - colors array is infinite and constant and this method
   * returns only `arraySize` first elements of it.
   * @public
   * @param {number} arraySize integer > 0
   * @returns {Array<string>} array of colors
   */
  generateColorsArray(arraySize) {
    const generatedColors = [];
    for (let i = 0; i < arraySize; i++) {
      generatedColors.push(this.generateColorForIndex(i));
    }
    return generatedColors;
  }

  /**
   * Generates color corresponding to a key. It is guaranteed, that
   * for the same key and generator instance this method will always return
   * the same result.
   * @public
   * @param {unknown} key
   * @returns {string} color
   */
  generateColorForKey(key) {
    if (this.generatedColorsForKeys.has(key)) {
      return this.generatedColorsForKeys.get(key);
    } else {
      const newColorIndex = this.generatedColorsForKeys.size;
      const newColor = this.generateColorForIndex(newColorIndex);
      this.generatedColorsForKeys.set(key, newColor);
      return newColor;
    }
  }

  /**
   * Generates color corresponding to given index. It is guaranteed, that
   * for the same index this method will always return the same result.
   * @private
   * @param {number} index integer >= 0
   * @returns {string} color
   */
  generateColorForIndex(index) {
    // Choosing a main color, which will be used in the color generation.
    // The main color is selected using the round robin strategy from the base colors.
    const mainColorIdx = index % this.baseColors.length;
    const mainColor = new Color(this.baseColors[mainColorIdx]);

    // Calculating index of main color shade. For example for index == 17
    // and 5 base colors main color shade will be 3 (because shade 0 was for indices
    // 0 to 4 - one for each base color, shade 1 for indices 5 to 9 and so on).
    // It can be interpreted as a number of main color usages in the round robin
    // algorithm above.
    const shadeIdx = Math.floor(index / this.baseColors.length);

    // Color shade calculation is organized in levels, which defines how main
    // color brightness change is obtained. Each shade belongs to only one particular
    // level. For example shades on levels 0 - 2 have brightnesses:
    // Level 0 (shade 0): 0.5
    // Level 1 (shades 1 and 2): 0.25, 0.75
    // Level 2 (shades 3, 4, 5 and 6): 0.125, 0.375, 0.625, 0.875
    // ... and so on.
    // 0.5 means the main color without change. < 0.5 means a darker color,
    // > 0.5 means a lighter one.
    // Each level describes two times more shades than the previous one, because the
    // difference between shade brightnesses is smaller.
    // This strategy gives us always the same brightness for the same shade index.
    // Also it is guaranteed that there will be no brightness duplication across
    // different levels.

    // E.g. For shade 4 it is level 2.
    const shadeLevel = Math.floor(Math.log2(shadeIdx + 1));
    // Index of shade in its shade level (e.g. for shade 4 it has index 1 in level 2).
    const shadeIdxInLevel = shadeIdx - Math.pow(2, shadeLevel) + 1;

    // Finding the first (darkest) brightness of shade in the shade level
    // (e.g. it is 0.125 for level 2)
    const darkestBrightnessInLevel = 1 / Math.pow(2, shadeLevel + 1);
    // Difference between consecutive brightnesses in the shade level (e.g. it is
    // 0.25 for level 2).
    const brightnessDiffInLevel = 1 / Math.pow(2, shadeLevel);

    // Calculating shade brightness to generate. Subtracting from 1 to generate
    // lighter colors before darker ones (reversing order of brightnesses in the
    // shade level - e.g. 0.375 becomes 0.625).
    const shadeBrightness = 1 - (darkestBrightnessInLevel + shadeIdxInLevel * brightnessDiffInLevel);

    // Rescaling shade brightness to be valid for Color library:
    // - moving brightness value range so that 0.5 (no brightness change) is now on 0,
    // - scaling brightness value to discard extremely light/dark values.
    const rescaledShadeBrightness = (shadeBrightness - 0.5) * 0.8;

    // Generating color. Negative `rescaledShadeBrightness` means that color should be darkened,
    // positive value means that color should be lightened (because after rescaling
    // 0 means no change in brightness).
    const generatedColor = rescaledShadeBrightness < 0 ?
      mainColor.darken(-rescaledShadeBrightness) :
      mainColor.lighten(rescaledShadeBrightness);

    return generatedColor.hex();
  }
}
