/**
 * Delegates chart event handling to specified destination.
 *
 * Options:
 * * eventHandler: (eventName: string, data: object, chart: object)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function eventListener(options) {
  console.assert(
    options && typeof options.eventHandler === 'function',
    'eventHandler must be a function'
  );
  return (chart) =>
    chart.on('*', (eventName, data) =>
      options.eventHandler({
        eventName,
        data,
        chart,
      })
    );
}
