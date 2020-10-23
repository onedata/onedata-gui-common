import resolver from './helpers/resolver';
import './helpers/responsive';
import { mocha } from 'mocha';

import { setResolver } from 'ember-mocha';

setResolver(resolver);

mocha.setup({
  // FIXME: restore 5000
  timeout: 600000,
});
