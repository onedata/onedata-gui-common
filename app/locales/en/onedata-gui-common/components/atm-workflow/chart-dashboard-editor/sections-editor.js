import chart from './sections-editor/chart';
import section from './sections-editor/section';
import floatingToolbar from './sections-editor/floating-toolbar';
import sidebar from './sections-editor/sidebar';
import sectionDetailsEditor from './sections-editor/section-details-editor';
import chartDetailsEditor from './sections-editor/chart-details-editor';

export default {
  chart,
  section,
  floatingToolbar,
  sidebar,
  sectionDetailsEditor,
  chartDetailsEditor,
  preview: 'Preview',
  previewTooltip: 'Sections and charts presented in the preview are a simulation of the dashboard as seen by the user. It is based on the current configuration of dashboard elements and random input data. May be incomplete if the configuration is incorrect.',
};
