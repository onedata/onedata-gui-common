import resolver from './helpers/resolver';
import './helpers/responsive';
import { mocha } from 'mocha';

import { setResolver } from 'ember-mocha';

setResolver(resolver);

mocha.setup({
  timeout: 5000,
});
