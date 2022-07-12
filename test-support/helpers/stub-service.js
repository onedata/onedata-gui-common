export function registerService(testCase, name, stub) {
  testCase.owner.unregister(`service:${name}`);
  testCase.owner.register(`service:${name}`, stub);
  return lookupService(testCase, name);
}

export function lookupService(testCase, name) {
  return testCase.owner.lookup(`service:${name}`);
}
