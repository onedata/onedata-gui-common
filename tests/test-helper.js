import resolver from './helpers/resolver';
import './helpers/responsive';
import { mocha } from 'mocha';
import { setResolver } from 'ember-mocha';
import handleHidepassed from './handle-hidepassed';

setResolver(resolver);

mocha.setup({
  timeout: 5000,
});

handleHidepassed();
