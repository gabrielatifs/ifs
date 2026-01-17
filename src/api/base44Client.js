// MOCK MODE: Using local mock instead of @base44/sdk
// This allows the app to run entirely locally without Base44 backend

// Original Base44 SDK import (commented out for local development):
// import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Use mock client for local development
import { createClient } from './mockBase44Client';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b9a3d96daf168696381e05",
  requiresAuth: true // Ensure authentication is required for all operations
});
