import OperatorQueryBlock from 'onedata-gui-common/utils/query-builder/operator-query-block';

export default OperatorQueryBlock.extend({
  /**
   * @override
   */
  maxOperandsNumber: 1,

  /**
   * @override
   */
  operator: 'root',
});
