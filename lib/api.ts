// Base API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient 
    ? process.env.NEXT_PUBLIC_API_URL || '/api'
    : process.env.API_URL || 'http://localhost:3000/api';
  
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred while fetching the data');
  }

  return response.json();
}