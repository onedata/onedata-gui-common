/* eslint-env node */
module.exports = {
  framework: 'mocha',
  test_page: 'tests/index.html?hidepassed',
  report_file: 'tmp/test-results.xml',
  disable_watching: true,
  launch_in_ci: [
    'Chrome',
  ],
  launch_in_dev: [
    'Chrome',
  ],
  // TODO: use only for CI on xvfb and dockerized env
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
      ].filter(Boolean)
    }
  }
};
