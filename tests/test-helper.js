import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import resolver from './helpers/resolver';
import './helpers/responsive';
import { unsuppressRejections } from './helpers/suppress-rejections';
import handleHidepassed from './handle-hidepassed';

mocha.setup({
  timeout: 5000,
});
setResolver(resolver);

afterEach(unsuppressRejections);

handleHidepassed();
start();
