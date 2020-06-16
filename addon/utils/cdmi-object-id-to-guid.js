/**
 * Computes GUID from CDMI Object ID. For conversion algorithm details see documentation of
 * utils/guid-to-cdmi-object-id.
 * 
 * @module utils/cdmi-object-id-to-guid
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function cdmiObjectIdToGuid(cdmiObjectId) {
  // convert to an array of bytes, omit first 8 bytes, which are useless for conversion
  const bin = [];
  for (let i = 8 * 2; i < cdmiObjectId.length; i += 2) {
    bin.push(Number.parseInt(cdmiObjectId.substring(i, i + 2), 16));
  }

  return btoa(String.fromCharCode(...bin)).split('=')[0];
}
