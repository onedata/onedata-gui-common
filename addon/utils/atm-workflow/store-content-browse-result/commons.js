/**
 * Contains typedefs reused between various types of automation stores content browse results.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmAvailableValueContainer<T>
 * @property {true} success
 * @property {T} value
 */

/**
 * @typedef {Object} AtmUnavailableValueContainer
 * @property {false} success
 * @property {unknown} error
 */

/**
 * @typedef {AtmAvailableValueContainer<T> | AtmUnavailableValueContainer} AtmValueContainer<T>
 */

/**
 * @typedef {AtmValueContainer<T> & { index: string }} AtmIndexedValueContainer<T>
 */
