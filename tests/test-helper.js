import { start, setResolver } from 'ember-mocha';
import { mocha } from 'mocha';
import resolver from './helpers/resolver';
import './helpers/responsive';
import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';

// TODO: VFS-8903 Remove silenceDeprecations call
silenceDeprecations();

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);
start();
