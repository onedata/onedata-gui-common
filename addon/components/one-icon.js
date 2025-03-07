/**
 * Inserts an icon from oneicons font.
 * Typical usage: `<OneIcon @icon="home" />`
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/template';
import isOneicon from 'onedata-gui-common/utils/is-oneicon';
import config from 'ember-get-config';
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class OneIconComponent extends Component {
  /**
   * Icon name (from oneicons font, without `oneicon-` prefix).
   * @virtual
   * @type {OneIconName|undefined}
   */
  @computed('args.icon')
  get icon() {
    return this.args.icon;
  }

  /**
   * Icon color applied to style.
   * @virtual optional
   * @type {string|undefined}
   */
  @computed('args.color')
  get color() {
    return this.args.color;
  }

  /**
   * @type {string}
   */
  @computed('icon')
  get iconClass() {
    if (config.environment !== 'production' && !isOneicon(this.icon)) {
      const message = `Unknown oneicon used: "${this.icon}"`;
      if (config.environment === 'test' && this.icon) {
        throw new Error(message);
      } else {
        console.warn(message);
      }
    }
    return `oneicon-${this.icon}`;
  }

  /**
   * @type {string|undefined}
   */
  @computed('color')
  get style() {
    return this.color ? htmlSafe(`color: ${this.color};`) : undefined;
  }

  get elementId() {
    return guidFor(this);
  }
}
