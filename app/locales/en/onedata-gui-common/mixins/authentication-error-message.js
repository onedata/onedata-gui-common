export default {
  contactInfo: 'If the problem persists, please contact the site administrators and quote the below request state identifier:',
  // NOTE: if adding translation here, don't forget to add new message type to
  // mixins/authentication_error_messages
  codes: {
    bad_auth_config: 'The Onezone server seems to be misconfigured.',
    invalid_state: 'Sign-in failed due to bad request state - this can happen if you do not complete your sign-in process within {{attribute}} seconds since redirection to chosen Identity Provider.',
    invalid_auth_request: 'Your sign-in request could not be validated.',
    idp_unreachable: 'The Identity Provider of your choice seems to be temporarily unavailable, please try again later.',
    bad_idp_response: 'Your Identity Provider returned an unexpected response.',
    cannot_resolve_required_attribute: 'Could not resolve required attribute "{{attribute}}" from the information sent by your Identity Provider.',
    internal_server_error: 'The server has encountered an unexpected error while processing your sign-in request.',
    account_already_linked_to_another_user: 'You cannot link this account because it is already linked to another user profile.',
    account_already_linked_to_current_user: 'This account is already linked to your profile.',
    unknown: 'Unknown reason.',
  },
};
