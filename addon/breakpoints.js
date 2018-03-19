import breakpointValues from 'onedata-gui-common/breakpoint-values';

const {
  screenSm,
  screenMd,
  screenLg,
} = breakpointValues;

export default {
  mobile: `(max-width: ${screenSm}px)`,
  tablet: `(min-width: ${screenSm}px) and (max-width: ${screenMd}px)`,
  desktop: `(min-width: ${screenMd}px)`,
  md: `(min-width: ${screenMd}px) and (max-width: ${screenLg}px)`
};
