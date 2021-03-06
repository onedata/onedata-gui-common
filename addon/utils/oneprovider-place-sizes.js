/**
 * Compute various sizes for Oneprovider circle styles on the scalable map
 * 
 * @module utils/oneprovider-place-sizes
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function oneproviderPlaceSizes(mapSize, scale) {
  const base = mapSize * 0.01 * scale;
  return {
    width: base,
    borderWidth: base / 15,
    fontSize: base * 0.75,
  };
}
