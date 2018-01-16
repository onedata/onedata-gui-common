// FIXME: docs, signature may change
import { computed } from '@ember/object';

export default function emberComputedPipe() {
  const functions = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
  const key = arguments[arguments.length - 1];
  return computed(key, function () {
    let buf = this.get(key);
    functions.forEach(fun => {
      buf = fun(buf);
    });
    return buf;
  });
}
