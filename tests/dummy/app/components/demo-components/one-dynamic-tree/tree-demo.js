/**
 * @module components/demo-components/one-dynamic-tree/tree-demo
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneDynamicTree from 'dummy/components/one-dynamic-tree';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'dummy/utils/create-field-validator';
import treeDefinition from 'dummy/utils/one-dynamic-tree/sample-tree-definition';

const VALIDATIONS_PROTO = {};

function prepareValidators(node, parentPath) {
  let path = parentPath + (parentPath ? '.' : '') + node.name;
  if (!node.subtree && node.field) {
    VALIDATIONS_PROTO[path] = createFieldValidator(node.field);
  } else if (node.subtree) {
    node.subtree.forEach((subnode) => prepareValidators(subnode, path));
  }
}

treeDefinition.forEach((node) => prepareValidators(node, 'values'));
const Validations = buildValidations(VALIDATIONS_PROTO);

export default OneDynamicTree.extend(Validations, {
  definition: treeDefinition,
});
