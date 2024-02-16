/**
 * Contains all missing types describing external libraries structures, which
 * are globally used by Onedata GUIs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/template';

// Ember does not export SafeString class, so we need to get it another way.
export type SafeString = ReturnType<typeof htmlSafe>;

export type I18nService = {
  t(
    translationPath: string,
    placeholders?: Record<string, string | SafeString>,
  ): SafeString;
};
