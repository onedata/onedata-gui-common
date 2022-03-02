import { start, setResolver } from 'ember-mocha';
import { mocha } from 'mocha';
import resolver from './helpers/resolver';
import './helpers/responsive';
import silenceDeprecation from 'onedata-gui-common/utils/silence-deprecations';

silenceDeprecation();

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);
start();
