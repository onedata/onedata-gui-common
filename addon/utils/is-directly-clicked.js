/**
 * Returns true if provided element was click directly (without no intermediate elements
 * with ".clickable" class).
 *
 * @module utils/is-directly-clicked
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function isDirectlyClicked(event, element) {
  if (!event || !element) {
    return false;
  }

  const clickableElements = [...element.querySelectorAll('.clickable')];

  if (
    clickableElements.includes(event.target) ||
    clickableElements.some(clkElement => clkElement.contains(event.target)) ||
    !element.contains(event.target)
  ) {
    // Should be handled by another clickable element.
    return false;
  }

  return true;
}
