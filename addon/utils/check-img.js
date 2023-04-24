/**
 * Check if some address can be reached using get image hack
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

export default function checkImg(url) {
  const img = globals.document.body.appendChild(globals.document.createElement('img'));
  img.classList.add('hidden');
  return new Promise((resolve, reject) => {
    try {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } catch (error) {
      reject(error);
    }
  }).finally(() => globals.document.body.removeChild(img));
}
