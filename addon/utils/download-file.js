/**
 * Downloads file using given URL.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';

export default function downloadFile({ fileUrl, _window }) {
  const body = _window.document.body;
  const iframe = $('<iframe/>').attr({
    src: fileUrl,
    style: 'display:none;',
  }).appendTo(body);
  // the time should be long to support some download extensions in Firefox desktop
  setTimeout(() => iframe.remove(), 60000);
}

export function downloadData({ dataString, fileName, mimeType, _window }) {
  const blobToDownload = new Blob([dataString], {
    type: mimeType,
    name: fileName,
  });
  const downloadUrl = _window.URL.createObjectURL(blobToDownload);

  const link = _window.document.createElement('a');
  link.type = mimeType;
  link.href = downloadUrl;
  link.download = fileName;
  link.target = '_blank';
  link.dispatchEvent(new MouseEvent('click'));
}
