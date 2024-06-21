import { observer, defineProperty } from '@ember/object';
import { reads } from '@ember/object/computed';

export default function installGetByProperty(
  emberObject,
  newPropertyName,
  sourceObjectKey,
  targetPropertyPath
) {
  const definitionObserver = observer(
    'sourceObjectKey',
    'targetPropertyPath',
    function defineDefaultValue() {
      defineProperty(
        this,
        newPropertyName,
        reads(`${sourceObjectKey}.${targetPropertyPath}`)
      );
    }
  );
  const observerName = `__${newPropertyName}DefinitionObserver`;
  defineProperty(
    emberObject,
    observerName,
    definitionObserver
  );
  emberObject[observerName]();
}
