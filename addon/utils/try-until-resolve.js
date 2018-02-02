// FIXME: jsdoc

export default function tryUntilResolve(fun, limit, interval = 1) {
  const promise = fun();
  return promise
    .catch(error => {
      if (limit <= 1) {
        throw error;
      } else {
        return new Promise(resolve => {
          setTimeout(() => resolve(
              tryUntilResolve(fun, limit - 1, interval)),
            interval
          )
        });
      }
    });
}
