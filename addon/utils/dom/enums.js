/**
 * Contains enum definitions related to DOM.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {'contentBox'|'paddingBox'|'borderBox'|'marginBox'} LayoutBox
 * Name taken from https://www.w3.org/TR/css-box-3/#typedef-layout-box
 */

/**
 * @type {Object<string, LayoutBox>}
 */
export const LayoutBox = Object.freeze({
  ContentBox: 'contentBox',
  PaddingBox: 'paddingBox',
  BorderBox: 'borderBox',
  MarginBox: 'marginBox',
});
