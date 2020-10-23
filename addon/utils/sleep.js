// FIXME: jsdoc

import { Promise } from 'rsvp';

export default async function sleep(timeout) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}
