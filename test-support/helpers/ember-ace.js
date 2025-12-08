import { hbs } from 'ember-cli-htmlbars';
import TestComponent from 'onedata-gui-common/components/test-component';

export function replaceEmberAceWithTextarea(context, { classname } = {}) {
  const aceTextareaArgs = {
    classname,
  };
  context.owner.register('component:ember-ace', TestComponent.extend({
    layout: hbs`<textarea
      class={{this.aceTextareaArgs.classname}}
      value={{this.value}}
      oninput={{action (or this.update (no-action)) value="target.value"}}
      disabled={{this.readOnly}}
      onblur={{action "blur"}}
    ></textarea>`,

    /**
     * @virtual
     * @type {((component: Ember.Component) => void) | null}
     */
    ready: null,

    /**
     * @type {{ classname: string}}
     */
    aceTextareaArgs,

    /**
     * @type {Object<string, Array<() => void)>}
     */
    eventListeners: undefined,

    /**
     * @override
     */
    init() {
      this._super(...arguments);
      this.set('eventListeners', {});
    },

    /**
     * @override
     */
    didInsertElement() {
      this._super(...arguments);
      this.ready?.(this);
    },

    /**
     * Method to mimic ACE api
     * @returns {Ember.Component}
     */
    getSession() {
      return this;
    },

    /**
     * Method to mimic ACE api
     * @param {string} eventName
     * @param {() => void} listener
     */
    addEventListener(eventName, listener) {
      if (!this.eventListeners[eventName]) {
        this.eventListeners[eventName] = [];
      }
      this.eventListeners[eventName].push(listener);
    },

    actions: {
      blur() {
        this.eventListeners.blur?.forEach((listener) => listener());
      },
    },
  }));
}
