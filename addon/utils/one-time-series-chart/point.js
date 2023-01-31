/**
 * Creates a single point object.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { timeSeriesMetricResolutionsMap } from 'onedata-gui-common/utils/time-series';

/**
 * @typedef {Object} PointParams
 * @property {Point['pointDuration']} [pointDuration]
 * @property {Point['firstMeasurementTimestamp']} [firstMeasurementTimestamp]
 * @property {Point['lastMeasurementTimestamp']} [lastMeasurementTimestamp]
 * @property {Point['fake']} [fake]
 * @property {Point['oldest']} [oldest]
 * @property {Point['newest']} [newest]
 */

export default class Point {
  /**
   * @public
   * @param {number} timestamp
   * @param {number | null} [value]
   * @param {PointParams} [params]
   */
  constructor(timestamp, value = null, params = {}) {
    /**
     * Timestamp in seconds. Points to the beginning of the point time window.
     * @public
     * @type {number}
     */
    this.timestamp = timestamp;

    /**
     * Measurement value. `null` means there were no measurements at this point.
     * @public
     * @type {number | null}
     */
    this.value = value;

    /**
     * Time (in seconds) which this point takes on the X (time) axis of the
     * chart. It's the same for all points in the chart and does not depend on
     * any real processing time. For real duration, use `measurementDuration`.
     *
     * Using 5s as a fallback value. 5s is the smallest possible time resolution
     * in time series.
     * @public
     * @type {number}
     */
    this.pointDuration = params.pointDuration ??
      timeSeriesMetricResolutionsMap.fiveSeconds;

    /**
     * Timestamp (in seconds) of the first measurement aggregated within this
     * point. It's not a required field - might be null even when the value is
     * present (so there was at least one measurement). When provided, it's
     * always greater than or equal to `timestamp`.
     * @public
     * @type {number | null}
     */
    this.firstMeasurementTimestamp = params.firstMeasurementTimestamp ?? null;

    /**
     * Timestamp (in seconds) of the last measurement aggregated within this
     * point. It's not a required field - might be null even when the value is
     * present (so there was at least one measurement). When provided, it's
     * always greater than or equal to `firstMeasurementTimestamp` and smaller
     * than `timestamp + pointDuration`.
     * @public
     * @type {number | null}
     */
    this.lastMeasurementTimestamp = params.lastMeasurementTimestamp ?? null;

    /**
     * When set to true, it means that this point has been generated on-the-fly
     * because data source did not mention it. It may happen when there are time
     * gaps in incoming data or there is a need to provide extra points to fill
     * the whole chart near the data oldest/newest sides.
     * @public
     * @type {boolean}
     */
    this.fake = params.fake ?? false;

    /**
     * When set to true, it means that before this point there are no other
     * (meaningful) points available. There can exist some e.g. for chart points
     * alignment purposes, but all of them will be fake.
     * @public
     * @type {boolean}
     */
    this.oldest = params.oldest ?? false;

    /**
     * When set to true, it means that after this point there are no other
     * (meaningful) points available. There can exist some e.g. for chart points
     * alignment purposes, but all of them will be fake.
     * @public
     * @type {boolean}
     */
    this.newest = params.newest ?? false;
  }

  /**
   * Real time (in seconds) in which data was aggregated in this particular
   * point. If point is in the middle of series points, then
   * `measurementDuration` equals `pointDuration`. If it is at it's edge, values
   * of `firstMeasurementTimestamp` and `lastMeasurementTimestamp` are taken
   * into account when calculating `measurementDuration`. See more about how
   * this values changes for each point in `measurementDuration` getter
   * function.
   * @public
   * @type {number}
   */
  get measurementDuration() {
    const firstMeasurementTimestamp = this.firstMeasurementTimestamp ?? this.timestamp;
    const lastMeasurementTimestamp = this.lastMeasurementTimestamp ??
      (this.timestamp + this.pointDuration - 1);

    let measurementDuration;
    if (!this.oldest && !this.newest) {
      // All points in the middle of chart
      measurementDuration = this.pointDuration;
    } else if (this.fake && (this.oldest || this.newest)) {
      // Fake points at oldest or newest edge
      measurementDuration = 1;
    } else if (this.oldest && !this.newest) {
      // Real points at oldest edge only
      measurementDuration =
        this.timestamp + this.pointDuration - firstMeasurementTimestamp;
    } else if (!this.oldest && this.newest) {
      // Real points at newest edge only
      measurementDuration = lastMeasurementTimestamp - this.timestamp + 1;
    } else if (this.oldest && this.newest) {
      // Real points at both oldest and newest edge
      measurementDuration = lastMeasurementTimestamp - firstMeasurementTimestamp + 1;
    } else {
      // This should newer happen. Left for safety.
      measurementDuration = 1;
    }

    return Math.max(measurementDuration, 1);
  }

  /**
   * @public
   * @returns {Point}
   */
  clone() {
    return new Point(this.timestamp, this.value, {
      pointDuration: this.pointDuration,
      firstMeasurementTimestamp: this.firstMeasurementTimestamp,
      lastMeasurementTimestamp: this.lastMeasurementTimestamp,
      fake: this.fake,
      oldest: this.oldest,
      newest: this.newest,
    });
  }
}
