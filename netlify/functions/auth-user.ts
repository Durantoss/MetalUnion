import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    // For Netlify static deployment, always return guest user
    // In a real deployment, you would check authentication here
    const guestUser = {
      id: 'guest-user',
      stagename: 'Guest',
      email: 'guest@moshunion.com',
      role: 'user',
      isAdmin: false,
      permissions: {},
      concertAttendanceCount: 0,
      commentCount: 0,
      reviewCount: 0,
      isOnline: true,
      loginStreak: 0,
      totalReviews: 0,
      totalPhotos: 0,
      totalLikes: 0,
      isGuest: true
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(guestUser),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
