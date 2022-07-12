/**
 * Contains type definitions related to "array" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmArrayDataSpec
 * @property {'array'} type
 * @property {AtmArrayValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmArrayValueConstraints
 * @property {AtmDataSpec} itemDataSpec
 */
