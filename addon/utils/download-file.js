/**
 * Downloads file using given URL.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';
import globals from 'onedata-gui-common/utils/globals';

export default function downloadFile({ fileUrl }) {
  const body = globals.document.body;
  const iframe = $('<iframe/>').attr({
    src: fileUrl,
    style: 'display:none;',
  }).appendTo(body);
  // the time should be long to support some download extensions in Firefox desktop
  setTimeout(() => iframe.remove(), 60000);
}

export function downloadData({ dataString, fileName, mimeType }) {
  const blobToDownload = new Blob([dataString], {
    type: mimeType,
    name: fileName,
  });
  const downloadUrl = globals.window.URL.createObjectURL(blobToDownload);

  const link = globals.document.createElement('a');
  link.type = mimeType;
  link.href = downloadUrl;
  link.download = fileName;
  link.target = '_blank';
  link.dispatchEvent(new MouseEvent('click'));
}
