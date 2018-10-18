import Route from '@ember/routing/route';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import AuthenticationErrorHandlerMixin from 'onedata-gui-common/mixins/authentication-error-handler';

export default Route.extend(
  UnauthenticatedRouteMixin,
  I18n,
  AuthenticationErrorHandlerMixin, {
    i18n: inject(),

    /**
     * @override
     */
    i18nPrefix: 'routes.login',

    setupController(controller) {
      controller.setProperties(this.consumeAuthenticationError());
    },

    titleToken: computed(function () {
      return this.t('login');
    }),
  });
