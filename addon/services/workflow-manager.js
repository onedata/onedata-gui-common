import Service from '@ember/service';

export default Service.extend({
  /**
   * @virtual
   * @type {number}
   */
  atmLaneInstantFailureExceptionThreshold: 0.1,
});
