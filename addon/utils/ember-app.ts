/**
 * Persists reference to Ember application so that code being outside of Ember
 * objects can access specific Ember features (like translations, services, etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Application from '@ember/application';

let emberApp: Application | null = null;

export function setEmberApp(app: Application): void {
  emberApp = app;
}

export function getEmberApp(): Application | null {
  return emberApp;
}

export function lookupInEmberApp<T>(lookupString: string): T | undefined {
  // Types are a bit ahead of the current Ember version. To trick the missing
  // `.resolve()` method we use private `__container__` property.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getEmberApp() as any)?.__container__?.lookup(lookupString);
}
