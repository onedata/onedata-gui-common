export default function onedataRouterSetup(routerClass, router) {
  routerClass.reopen({
    location: 'hash',
    rootURL: '/',
    redirects: {
      wildcard: 'login',
    }
  });

  router.route('onedata', function () {
    this.route('sidebar', { path: ':type' }, function () {
      this.route('content', { path: ':resourceId' }, function () {
        this.route('aspect', { path: ':aspectId' });
      });
    });
  });
  router.route('login');
  router.route('wildcard', { path: "*path" });
}
