export const TOPICS_MATCHING = {
  MATCHING_SUCCESS: 'matching-success'
};

export const API_ENDPOINTS_MATCHING = {
  MATCHING_REQUEST: '/api/matching-service/matching-request',
  MATCHING_SUCCESS: '/api/matching-service/matching-success',
  MATCHING_CANCEL: '/api/matching-service/matching-cancel'
};

export const WS_EVENTS = {
  JOIN: 'join',
  DISCONNECT: 'disconnect',
  CLOSE: 'close',
  ERROR: 'error',
  MATCHING_REQUEST: 'request_matching',
  MATCHING_CANCEL: 'cancel_matching',
  MATCHING_SUCCESS: 'matching_success',
  MATCHING_FAILED: 'matching_failed',
  MATCHING_REQUEST_RECEIVED: 'matching_request_received'
}