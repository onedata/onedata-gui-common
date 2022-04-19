import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import resolver from './helpers/resolver';
import './helpers/responsive';
import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';
import { unsuppressRejections } from './helpers/suppress-rejections';
import handleHidepassed from './handle-hidepassed';

// TODO: VFS-8903 Remove silenceDeprecations call
silenceDeprecations();

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);

afterEach(unsuppressRejections);

handleHidepassed();
start();
