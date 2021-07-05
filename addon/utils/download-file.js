/**
 * Downloads file using given URL.
 *
 * @module util/download-file
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';
import { get } from '@ember/object';

export default function downloadFile({ fileUrl, isMobileService, _window }) {
  const isMobileBrowser = get(isMobileService, 'any');
  if (!fileUrl) {
    return;
  }

  if (isMobileBrowser) {
    downloadUsingOpen(fileUrl, isMobileService, _window);
  } else {
    downloadUsingIframe(fileUrl, _window);
  }
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

function downloadUsingIframe(fileUrl, _window) {
  const body = _window.document.body;
  const iframe = $('<iframe/>').attr({
    src: fileUrl,
    style: 'display:none;',
  }).appendTo(body);
  // the time should be long to support some download extensions in Firefox desktop
  setTimeout(() => iframe.remove(), 60000);
}

function downloadUsingOpen(fileUrl, isMobileService, _window) {
  // Apple devices such as iPad tries to open file using its embedded viewer
  // in any browser, but we cannot say if the file extension is currently supported
  // so we try to open every file in new tab.
  const target = get(isMobileService, 'apple.device') ? '_blank' : '_self';
  _window.open(fileUrl, target);
}
