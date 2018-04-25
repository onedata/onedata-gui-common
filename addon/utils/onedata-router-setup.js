export default function onedataRouterSetup(routerClass, router) {
  routerClass.reopen({
    location: 'hash',
    rootURL: '/',
  });

  router.route('onedata', function () {
    this.route('sidebar', { path: ':type' }, function () {
      this.route('content', { path: ':resource_id' }, function () {
        this.route('aspect', { path: ':aspect_id' });
      });
    });
  });
  router.route('login');
  router.route('not-found', { path: "*" });
}
