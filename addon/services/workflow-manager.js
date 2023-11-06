import Service from '@ember/service';

export default Service.extend({
  /**
   * @virtual
   * @type {number}
   */
  atmInstantFailureExceptionThreshold: 0.1,
});
