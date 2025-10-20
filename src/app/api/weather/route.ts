import { NextRequest, NextResponse } from 'next/server';

// OpenMeteo API endpoints - no API key required
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';

// Timeout configuration
const FETCH_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'WeatherApp/1.0',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Helper function to retry fetch requests
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetchWithTimeout(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0 && (error instanceof Error && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')))) {
      console.log(`Retrying request to ${url}, attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Weather condition code to description mapping for OpenMeteo
const getWeatherDescription = (weatherCode: number): string => {
  const descriptions: { [key: number]: string } = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy', 
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    56: 'light freezing drizzle',
    57: 'dense freezing drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    66: 'light freezing rain',
    67: 'heavy freezing rain',
    71: 'slight snow fall',
    73: 'moderate snow fall',
    75: 'heavy snow fall',
    77: 'snow grains',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    85: 'slight snow showers',
    86: 'heavy snow showers',
    95: 'thunderstorm',
    96: 'thunderstorm with slight hail',
    99: 'thunderstorm with heavy hail'
  };
  return descriptions[weatherCode] || 'unknown';
};

// Weather condition code to icon mapping (simplified)
const getWeatherIcon = (weatherCode: number): string => {
  if (weatherCode === 0) return '01d'; // clear sky
  if ([1, 2].includes(weatherCode)) return '02d'; // partly cloudy
  if (weatherCode === 3) return '04d'; // overcast
  if ([45, 48].includes(weatherCode)) return '50d'; // fog
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return '09d'; // drizzle
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '10d'; // rain
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '13d'; // snow
  if ([95, 96, 99].includes(weatherCode)) return '11d'; // thunderstorm
  return '01d'; // default
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json(
      { error: 'City parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Get coordinates from city name using OpenMeteo Geocoding API
    console.log(`Fetching coordinates for city: ${city}`);
    const geocodingResponse = await fetchWithRetry(
      `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const geocodingData = await geocodingResponse.json();
    
    if (!geocodingData.results || geocodingData.results.length === 0) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    const location = geocodingData.results[0];
    const { latitude, longitude, name, country, timezone } = location;
    console.log(`Found coordinates: ${latitude}, ${longitude} for ${name}`);

    // Step 2: Get current weather data using OpenMeteo Weather API
    const weatherResponse = await fetchWithRetry(
      `${WEATHER_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover&timezone=${encodeURIComponent(timezone || 'auto')}`
    );

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    // Validate that we have the required weather data
    if (!current || typeof current.temperature_2m !== 'number') {
      throw new Error('Invalid weather data received from API');
    }

    // Get local time from the timezone
    const now = new Date();
    let localTime = now.toISOString();
    
    // Try to get a more accurate local time if possible
    if (timezone && timezone !== 'auto') {
      try {
        localTime = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now).replace(/(\d+)-(\d+)-(\d+), (\d+):(\d+):(\d+)/, '$1-$2-$3T$4:$5:$6') + '.000Z';
      } catch (error) {
        // If timezone parsing fails, keep the ISO string
        localTime = now.toISOString();
      }
    }

    // Format the response data to match the existing interface
    const formattedData = {
      city: name,
      country: country || location.country_code || 'Unknown',
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m || 0),
      cloudCover: Math.round(current.cloud_cover || 0),
      localTime: localTime,
      description: getWeatherDescription(current.weather_code || 0),
      icon: getWeatherIcon(current.weather_code || 0),
      coordinates: {
        lat: latitude,
        lon: longitude,
      },
    };

    console.log(`Successfully fetched weather for ${name}: ${formattedData.temperature}°C`);
    return NextResponse.json(formattedData);
    
  } catch (error) {
    console.error('OpenMeteo API error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Weather service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Cannot connect to weather service. Please check your internet connection.' },
          { status: 503 }
        );
      }
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch weather data. Please try again later.' },
      { status: 500 }
    );
  }
}