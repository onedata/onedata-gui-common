/**
 * Allows to access global objects without using the global scope. It enables
 * possibility to mock these global objects in tests (and only in tests!).
 *
 * `Globals` is intended to be a singleton. You should use the already created
 * instance exported from this module.
 *
 * HOW TO MOCK IN TESTS?
 *
 * WARNING: Always remember to add `globals.unmock()` to the global `afterEach`
 * hook of your testing environment to isolate tests properly!.
 *
 * Mocking uses native Proxy mechanism, which allows to preserve the original
 * behavior of the mocked object except fields, which are overwritten by mock.
 *
 * Example 1:
 * ```
 * globals.mock(GlobalName.Window, {
 *   innerWidth: 1234,
 * });
 * ```
 * This mock will change `innerWidth` property value of `window` to `1234`
 * without changing any other `window` property/method. What's important,
 * `innerWidth` will be changed ONLY FOR `global.window`. Native `window`
 * object will still have it's original `innerWidth` value.
 *
 * Doing this:
 * ```
 * globals.window.innerWidth = 4567;
 * ```
 * will change value of the mocked property only. Native `window.innerWidth`
 * will still be untouched. But doing this:
 * ```
 * globals.window.innerHeight = 8901;
 * ```
 * will influence native `window.innerHeight` (as this property was not mocked)
 * and probably cause an error.
 *
 * WARNING: You can modify only these properties of the mock, which were mocked
 * from the beginning. Any modification outside mocked properties will change
 * native object property and unmocking will not revert them!
 *
 * Example 2:
 * ```
 * globals.mock(GlobalName.Window, {
 *   resizeListeners: new Set(),
 *   addEventListener(event, listener) {
 *     if (event === 'resize') {
 *       this.resizeListeners.add(listener);
 *     } else {
 *       globals.nativeWindow.addEventListener(...arguments);
 *     }
 *   },
 *   removeEventListener(event, listener) {
 *     if (event === 'resize') {
 *       this.resizeListeners.delete(listener);
 *     } else {
 *       globals.nativeWindow.removeEventListener(...arguments);
 *     }
 *   },
 *   triggerResize() {
 *     this.resizeListeners.forEach((listener) => listener());
 *   },
 * });
 * ```
 * This mock intercepts any registrations of resize event listeners on `window`
 * and passes through any other event registrations to the native `window`.
 * It also adds a custom method `triggerResize` to our mocked `window`, which
 * allows to manually launch all intercepted resize listeners.
 *
 * That approach allows to simulate some particular type of events leaving
 * other event types handling untouched.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';

export enum GlobalName {
  Window = 'window',
  Document = 'document',
  Location = 'location',
  Navigator = 'navigator',
  LocalStorage = 'localStorage',
  SessionStorage = 'sessionStorage',
  Fetch = 'fetch',
}

const isTestingEnv = config.environment === 'test';

export class Globals {
  public get window(): Window {
    return this.getGlobal(GlobalName.Window);
  }

  public get document(): Document {
    return this.getGlobal(GlobalName.Document);
  }

  public get location(): Location {
    return this.getGlobal(GlobalName.Location);
  }

  public get navigator(): Navigator {
    return this.getGlobal(GlobalName.Navigator);
  }

  public get localStorage(): Storage {
    return this.getGlobal(GlobalName.LocalStorage);
  }

  public get sessionStorage(): Storage {
    return this.getGlobal(GlobalName.SessionStorage);
  }

  public get fetch(): typeof fetch {
    return this.getGlobal(GlobalName.Fetch);
  }

  public get nativeWindow(): Window {
    return this.getNativeGlobal(GlobalName.Window);
  }

  public get nativeDocument(): Document {
    return this.getNativeGlobal(GlobalName.Document);
  }

  public get nativeLocation(): Location {
    return this.getNativeGlobal(GlobalName.Location);
  }

  public get nativeNavigator(): Navigator {
    return this.getNativeGlobal(GlobalName.Navigator);
  }

  public get nativeLocalStorage(): Storage {
    return this.getNativeGlobal(GlobalName.LocalStorage);
  }

  public get nativeSessionStorage(): Storage {
    return this.getNativeGlobal(GlobalName.SessionStorage);
  }

  public get nativeFetch(): typeof fetch {
    return this.getNativeGlobal(GlobalName.Fetch);
  }

  private mocks: { [key in GlobalName]?: typeof window[key] } = {};

  public mock<T extends GlobalName>(globalName: T, mock: unknown): void {
    if (!isTestingEnv) {
      throw new Error(
        `Mocking global object ${globalName} in a non-testing environment is not allowed.`
      );
    }

    const nativeGlobal = this.getNativeGlobal(globalName);
    if (typeof nativeGlobal === 'object') {
      // Cannot use `nativeGlobal` directly as a target of the proxy, because
      // some globals have properties (like location.reload) which cannot be
      // mocked due to limitations of proxies on read-only fields. Using native
      // global directly will cause errors like:
      // ```
      // xyz is a read-only and non-configurable data property on the proxy
      // target but the proxy did not return its actual value
      // ```
      // To solve this, we use an empty object `{}` as a fake target and
      // redirect any get/set to the native global (as if it was a real proxy
      // target).
      this.mocks[globalName] = new Proxy({}, {
        get(target, propertyName) {
          if (mock && typeof mock === 'object' && propertyName in mock) {
            return mock[propertyName as keyof typeof mock];
          } else {
            const nativeValue = nativeGlobal[
              propertyName as keyof typeof nativeGlobal
            ] as Function | unknown;
            return typeof nativeValue === 'function' ?
              nativeValue.bind(nativeGlobal) : nativeValue;
          }
        },
        set(target, propertyName, value) {
          if (mock && typeof mock === 'object') {
            (mock[propertyName as keyof typeof mock] as unknown) = value;
          } else {
            nativeGlobal[propertyName as keyof typeof nativeGlobal] = value;
          }
          return true;
        },
      })  as typeof window[T];
    } else {
      this.mocks[globalName] = mock as typeof window[T];
    }
  }

  /**
   * @param globalName If not provided, all mocked globals will be unmocked.
   */
  public unmock(globalName?: GlobalName): void {
    if (globalName) {
      delete this.mocks[globalName];
    } else {
      this.mocks = {};
    }
  }

  private getGlobal<T extends GlobalName>(globalName: T): typeof window[T] {
    if (isTestingEnv && this.mocks[globalName]) {
      return this.mocks[globalName] as typeof window[T];
    }

    return this.getNativeGlobal(globalName);
  }

  private getNativeGlobal<T extends GlobalName>(globalName: T): typeof window[T] {
    /* eslint-disable-next-line no-restricted-globals */
    const nativeGlobal = window[globalName];
    return (typeof nativeGlobal === 'function' ? nativeGlobal.bind(window) : nativeGlobal) as typeof window[T];
  }
}

const globalsInstance = new Globals();
export default globalsInstance;
