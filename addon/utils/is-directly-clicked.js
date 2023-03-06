/**
 * Returns true if element has been clicked directly (without intermediate
 * elements with ".clickable" class). Providing element is optional - if not
 * supplied, `event.currentTarget` will be used.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function isDirectlyClicked(event, element) {
  const normalizedElement = element ?? event?.currentTarget;

  if (!event || !normalizedElement) {
    return false;
  }

  const clickableElements = [...normalizedElement.querySelectorAll('.clickable')];

  if (
    clickableElements.includes(event.target) ||
    clickableElements.some(clkElement => clkElement.contains(event.target)) ||
    !normalizedElement.contains(event.target)
  ) {
    // Should be handled by another clickable element.
    return false;
  }

  return true;
}
