/**
 * Common typedefs for validators.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {(value: unknown, atmDataSpec: AtmDataSpec, context: AtmValueValidatorContext) => boolean} AtmValueValidator
 */

/**
 * @typedef {Object} AtmValueValidatorContext
 * @property {(value: unknown, atmDataSpec: AtmDataSpec) => boolean} validateNestedValue
 */
