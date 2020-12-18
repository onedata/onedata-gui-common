import { beforeEach } from 'mocha';
import QueryValueComponentsBuilder from 'onedata-gui-common/utils/query-value-components-builder';

export default function setDefaultQueryValuesBuilder() {
  beforeEach(function () {
    this.set('valuesBuilder', QueryValueComponentsBuilder.create());
  });
}
