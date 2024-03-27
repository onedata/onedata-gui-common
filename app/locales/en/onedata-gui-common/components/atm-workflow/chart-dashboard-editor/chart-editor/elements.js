export default {
  header: 'Chart elements',
  tabNames: {
    series: 'Series',
    seriesGroups: 'Series groups',
    axes: 'Axes',
  },
  info: {
    series: {
      header: 'Series',
      content: 'The series is the main visual part of the chart. It is always based on data (time series) loaded from a particular automation store. You can transform the data by applying optional postprocessing functions before plotting. For cases when there are many time series of the same kind (named using the same prefix), it is possible to define a repeated series that will plot them all, reusing the same configuration.',
    },
    seriesGroups: {
      header: 'Series groups',
      content: 'You can use series groups to gather series that belong to the same category. As a result, all series in a group will be nested under the group\'s name in the chart\'s popover that shows their values for a selected point in time. Grouped series can be plotted in a stacked manner, then their sum is also presented.',
    },
    axes: {
      header: 'Axes',
      content: 'Every chart must have at least one Y-axis. All user-defined axes are the Y ones, while the X-axis always corresponds to the time.',
    },
  },
};
