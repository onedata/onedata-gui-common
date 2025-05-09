/**
 * Detects very simple URLs in provided text and returns HTML with anchors to them.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const urlRegexp: RegExp =
  /((http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-]))/g;

type AnchorizeTextOptions = {
  class: string;
  target: '_blank' | '_self' | '_parent' | '_top';
};

export function anchorizeText(text: string, options: AnchorizeTextOptions): string {
  let attrsString = '';
  if (options) {
    const attrs = [];
    if (options.class) {
      attrs.push(`class="${options.class}"`);
    }
    if (options.target) {
      attrs.push(`target="${options.target}"`);
    }
    attrsString = ' ' + attrs.join(' ');
  }
  return text.replaceAll(urlRegexp, `<a${attrsString} href="$1">$1</a>`);
}
