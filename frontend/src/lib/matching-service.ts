import type { MatchingResponse, UserMatchingCancelRequest, UserMatchingRequest } from '../../../shared/types/matching-types.ts';
import { API_ENDPOINTS_MATCHING } from '../../../shared/api-endpoints.ts';

const MATCHING_SERVICE_BASE_URL = import.meta.env.VITE_MATCHING_SERVICE_URL || 'http://localhost:4000';

export const matchingService = {
  // Start matching request
  async startMatching(request: UserMatchingRequest): Promise<void> {
    try {
      const response = await fetch(`${MATCHING_SERVICE_BASE_URL}${API_ENDPOINTS_MATCHING.MATCHING_REQUEST}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Error starting matching:', error);
      throw new Error('Failed to start matching. Please try again.');
    }
  },

  // Cancel matching request
  async cancelMatching(request: UserMatchingCancelRequest): Promise<void> {
    try {
      const response = await fetch(`${MATCHING_SERVICE_BASE_URL}${API_ENDPOINTS_MATCHING.MATCHING_CANCEL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Error cancelling matching:', error);
      throw new Error('Failed to cancel matching. Please try again.');
    }
  },
};
