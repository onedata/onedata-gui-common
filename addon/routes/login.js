import Route from '@ember/routing/route';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, I18n, {
  i18n: inject(),

  /**
   * @override
   */
  i18nPrefix: 'routes.login',

  titleToken: computed(function () {
    return this.t('login');
  }),
});
