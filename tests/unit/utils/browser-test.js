import { expect } from 'chai';
import { describe, it } from 'mocha';
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';
import globals from 'onedata-gui-common/utils/globals';

describe('Unit | Utility | browser', function () {
  itDetectsBrowserNameForUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    BrowserName.Chrome,
  );
  itDetectsBrowserNameForUserAgent(
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0',
    BrowserName.Firefox,
  );
  itDetectsBrowserNameForUserAgent(
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
    BrowserName.IE,
  );
  itDetectsBrowserNameForUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
    BrowserName.IE,
  );
  itDetectsBrowserNameForUserAgent(
    'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1',
    BrowserName.Opera,
  );
  itDetectsBrowserNameForUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    BrowserName.Safari,
  );
  itDetectsBrowserNameForUserAgent(
    'something random',
    BrowserName.Other,
  );
});

function itDetectsBrowserNameForUserAgent(userAgent, expectedBrowserName) {
  it(`detects browser name "${expectedBrowserName}" for userAgent "${userAgent}"`, function () {
    globals.mock('navigator', { userAgent });

    expect(browser.name).to.equal(expectedBrowserName);
  });
}
