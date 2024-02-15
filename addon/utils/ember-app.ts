/**
 * Persists reference to Ember application so that code being outside of Ember
 * objects can access specific Ember features (like translations, services, etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationInstance from '@ember/application/instance';

let emberApp: ApplicationInstance | null = null;

export function setEmberApp(app: ApplicationInstance): void {
  emberApp = app;
}

export function getEmberApp(): ApplicationInstance | null {
  return emberApp;
}

export function lookupInEmberApp<T>(lookupString: `${string}:${string}`): T | null {
  return (getEmberApp()?.lookup(lookupString) ?? null) as (T | null);
}
