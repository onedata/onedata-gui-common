export default function onedataRouterSetup(routerClass, router) {
  routerClass.reopen({
    location: 'hash',
    rootURL: '/',
    redirects: Object.freeze({
      wildcard: 'login',
    })
  });

  router.route('onedata', function () {
    this.route('sidebar', { path: ':type' }, function () {
      this.route('content', { path: ':resource_id' }, function () {
        this.route('aspect', { path: ':aspect_id' });
      });
    });
  });
  router.route('login');
  router.route('wildcard', { path: "*path" });
}
