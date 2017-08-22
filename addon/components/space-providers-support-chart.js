/**
 * A component that renders providers support for specified space.
 * Hovered provider can be set from the outside by specifying hoveredProviderId
 * property.
 *
 * @module components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/space-providers-support-chart';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import centeredText from 'onedata-gui-common/utils/chartist/centered-text';
import pieLabels from 'onedata-gui-common/utils/chartist/pie-labels';
import customCss from 'onedata-gui-common/utils/chartist/custom-css';

const {
  computed,
  get,
  getProperties,
  isArray,
} = Ember;

const INACTIVE_PROVIDER_OPACITY = 0.3;
const PROVIDER_HOVER_TRANSITION_TIME = 0.3;

export default Ember.Component.extend({
  layout,
  classNames: ['space-providers-support-chart'],

  /**
   * Space.
   * To inject.
   * @type {Space}
   */
  space: null,

  /**
   * Object with mapping providerId -> color. To refresh computed properties, 
   * reference must change.
   * To inject.
   * @type {Object}
   */
  providersColors: {},

  /**
   * If true, providers will be sorted by support size (descending).
   * @type {boolean}
   */
  sort: false,

  /**
   * Css opacity value of inactive (not hovered) provider slice.
   * @type {number}
   */
  inactiveOpacity: INACTIVE_PROVIDER_OPACITY,

  /**
   * Css transition time value for hovered provider slice animation.
   * @type {number}
   */
  hoverTransitionTime: PROVIDER_HOVER_TRANSITION_TIME,

  /**
   * Id of hovered (active) provider.
   * @type {string}
   */
  hoveredProviderId: null,

  /**
   * Timeout id for styles recompute (see _chartCss property)
   * @type {number}
   */
  _stylesRecomputeTimeoutId: -1,

  /**
   * If true, space object is valid and can be used as a data source for a chart.
   * @type {computed.boolean}
   */
  _isSpaceValid: computed('space', function () {
    let space = this.get('space');
    if (!space) {
      return false;
    }
    let {
      totalSize,
      supportSizes,
      providers
    } = getProperties(space, 'totalSize', 'supportSizes', 'providers');

    if (typeof totalSize !== 'number' || totalSize < 0 ||
      !supportSizes || !isArray(providers)) {
      return false;
    }

    let realTotalSize = 0;
    let errorOccurred = false;
    _.each(Object.keys(supportSizes), (providerId) => {
      let size = get(supportSizes, providerId);
      let provider = _.find(providers, { id: providerId });
      if (typeof size !== 'number' || size <= 0 || !provider) {
        errorOccurred = true;
      } else {
        realTotalSize += size;
      }
    });
    return !errorOccurred && realTotalSize === totalSize;
  }),

  /**
   * Chartist options
   * @type {Object}
   */
  _chartOptions: computed('space.totalSize', function () {
    let totalSize = this.get('space.totalSize');
    return {
      donut: true,
      donutWidth: '45%',
      showLabel: false,
      chartPadding: 20,
      plugins: [
        centeredText({
          text: bytesToString(totalSize, { iecFormat: true }),
        }),
        pieLabels({
          hideLabelThresholdPercent: 0,
        }),
        customCss(),
      ]
    };
  }),

  /**
   * An array of sorted (descending by support size) providers ids
   * @type {computed.Array.string}
   */
  _sortedProvidersIds: computed('sort', 'space.supportSizes', function () {
    let {
      sort,
      space,
    } = this.getProperties('sort', 'space');
    let supportSizes = get(space, 'supportSizes');
    if (!supportSizes) {
      return [];
    } else if (!sort) {
      return Object.keys(supportSizes);
    } else {
      return _.chain(supportSizes)
        .map((support, id) => ({ support, id }))
        .sortBy('support')
        .reverse()
        .map(({ id }) => id)
        .value();
    }
  }),

  /**
   * Chartist chart labels
   * @type computed.Array.string
   */
  _chartDataLabels: computed('space.supportSizes', '_sortedProvidersId',
    '_isSpaceValid',
    function () {
      let {
        space,
        _sortedProvidersIds,
        _isSpaceValid,
      } = this.getProperties(
        'space',
        '_sortedProvidersIds',
        '_isSpaceValid'
      );
      if (!_isSpaceValid) {
        return [];
      } else {
        let supportSizes = get(space, 'supportSizes');
        return _.map(_sortedProvidersIds, (providerId) => {
          let provider = _.find(get(space, 'providers'), { id: providerId });
          let className = 'label-provider-' + providerId;
          if (this._getProviderPercentSize(providerId) <= 0.15) {
            className += ' label-hidden';
          }
          // This object is not compatible with standard chartist label renderer.
          // It is specific for pie-labels plugin.
          return {
            topText: get(provider, 'name'),
            bottomText: bytesToString(
              supportSizes[providerId], { iecFormat: true }
            ),
            className,
          };
        });
      }
    }
  ),

  /**
   * Chartist chart series
   * @type computed.Array.Object
   */
  _chartDataSeries: computed('space.supportSizes', '_sortedProvidersIds',
    '_isSpaceValid',
    function () {
      let {
        space,
        _sortedProvidersIds,
        _isSpaceValid,
      } = this.getProperties('space', '_sortedProvidersIds', '_isSpaceValid');
      if (!_isSpaceValid) {
        return [];
      } else {
        let supportSizes = get(space, 'supportSizes');
        return _.map(_sortedProvidersIds, (providerId) => {
          return {
            data: supportSizes[providerId],
            className: 'slice-provider-' + providerId,
          };
        });
      }
    }
  ),

  /**
   * Chartist chart css
   * @type computed.Array.string
   */
  _chartCss: computed('space', '_sortedProvidersIds', 'providersColors',
    'hoveredProviderId', 'inactiveOpacity', 'hoverTransitionTime', {
      get() {
        let {
          _sortedProvidersIds,
          providersColors,
          hoveredProviderId,
          inactiveOpacity,
          hoverTransitionTime,
          _stylesRecomputeTimeoutId,
        } = this.getProperties(
          '_sortedProvidersIds',
          'providersColors',
          'hoveredProviderId',
          'inactiveOpacity',
          'hoverTransitionTime',
          '_stylesRecomputeTimeoutId'
        );
        let calculateStyles = () => {
          return _.map(_sortedProvidersIds, (providerId) => {
            // isActive = is nothing or this provider hovered
            let isActive = hoveredProviderId === providerId;
            let isLabelVisible = isActive || (!hoveredProviderId && 
              this._getProviderPercentSize(providerId) > 0.15);
            // actual values of label opacity and slice stroke-opacity are
            // remembered to save animation state through chart rerender
            return {
              'slice': {
                'stroke': providersColors[providerId] || null,
                'stroke-opacity': this._getSliceOpacity(providerId),
                'transitionProperties': {
                  'transition': `stroke-opacity ${hoverTransitionTime}s`,
                  'stroke-opacity': !hoveredProviderId || isActive ?
                    '1' : String(inactiveOpacity),
                }
              },
              'pie-label': {
                'opacity': this._getLabelOpacity(providerId),
                'pointer-events': isLabelVisible ? 'initial' : 'none',
                'transitionProperties': {
                  'transition': `opacity ${hoverTransitionTime}s`,
                  'opacity': isLabelVisible ? '1' : '0',
                }
              }
            };
          });
        };
        clearTimeout(_stylesRecomputeTimeoutId);
        this.set('_stylesRecomputeTimeoutId', setTimeout(() =>
          this.set('_chartCss', calculateStyles()), hoverTransitionTime * 1000));
        return calculateStyles();
      },
      set(key, value) {
        return value;
      }
    }
  ),

  /**
   * Chartist data
   * @type {computed.Object}
   */
  _chartData: computed('_chartDataLabels', '_chartDataSeries', '_chartCss',
    function () {
      let {
        _chartDataLabels,
        _chartDataSeries,
        _chartCss,
      } = this.getProperties(
        '_chartDataLabels',
        '_chartDataSeries',
        '_chartCss'
      );
      return {
        labels: _chartDataLabels,
        series: _chartDataSeries,
        customCss: _chartCss,
      };
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    this.$('.ct-chart').mousemove((event) => {
      let parentGroup = $(event.target).parents('.ct-series');
      if (parentGroup.length) {
        // extract providerId from group class name `slice-provider-[providerId]`
        let sliceClass = _.find(
          parentGroup.attr('class').split(' '),
          (c) => c.startsWith('slice-provider-')
        );
        let providerId = sliceClass.substr('slice-provider-'.length);
        this.set('hoveredProviderId', providerId);
      } else {
        // if label is hovered, ignore provider hover change
        parentGroup = $(event.target).parents('.ct-pie-label');
        if (parentGroup.length === 0) {
          this.set('hoveredProviderId', null);
        }
      }
    });
  },

  /**
   * Returns actual provider slice opacity
   * @param {string} providerId Provider id
   * @returns {string} stroke-opacity value
   */
  _getSliceOpacity(providerId) {
    return this.$('.slice-provider-' + providerId + ' path').css('stroke-opacity');
  },

  /**
   * Returns actual provider label opacity
   * @param {string} providerId Provider id
   * @returns {string} opacity value
   */
  _getLabelOpacity(providerId) {
    return this.$('.label-provider-' + providerId).css('opacity');
  },

  /**
   * Returns provider size share in space in percents
   * @param {string} providerId Provider id
   * @returns {number} Value 0 < x <= 1
   */
  _getProviderPercentSize(providerId) {
    let space = this.get('space');
    let {
      supportSizes,
      totalSize,
    } = getProperties(space, 'supportSizes', 'totalSize');
    return get(supportSizes, providerId) / totalSize;
  },
});
