import config from 'ember-get-config';

const {
  screenSm,
  screenMd,
  screenLg,
} = config.breakpoints;

export default {
  mobile: `(max-width: ${screenSm - 1}px)`,
  tablet: `(min-width: ${screenSm}px) and (max-width: ${screenMd - 1}px)`,
  desktop: `(min-width: ${screenMd}px)`,
  md: `(min-width: ${screenMd}px) and (max-width: ${screenLg - 1}px)`,
};
