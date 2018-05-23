export default function onedataRouterSetup(routerClass, router, setup = {}) {
  routerClass.reopen({
    location: 'hash',
    rootURL: '/',
  });

  router.route('onedata', function () {
    setup.onedata && setup.onedata.bind(this)();
    this.route('sidebar', { path: ':type' }, function () {
      setup.sidebar && setup.sidebar.bind(this)();
      this.route('content', { path: ':resource_id' }, function () {
        setup.content && setup.content.bind(this)();
        this.route('aspect', { path: ':aspect_id' });
      });
    });
  });
  router.route('login');
  router.route('not-found', { path: "*" });
}
