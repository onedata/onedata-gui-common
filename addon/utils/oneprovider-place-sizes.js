/**
 * Compute various sizes for Oneprovider circle styles on the scalable map
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function oneproviderPlaceSizes(mapSize, scale) {
  const base = Math.max(mapSize * 0.01 * scale, 20);
  return {
    width: base,
    borderWidth: base / 15,
    fontSize: base * 0.75,
  };
}
