import { NextRequest, NextResponse } from 'next/server';

/**
 * Optimized OpenWeatherMap API Route Handler
 * 
 * OPTIMIZATIONS IMPLEMENTED:
 * ✅ Reduced API calls from 2 to 1 (removed redundant geocoding call)
 * ✅ Added support for different unit systems (metric, imperial, standard)
 * ✅ Added multi-language support via lang parameter
 * ✅ Enhanced error handling with specific error codes
 * ✅ Better timezone handling using built-in timezone offset
 * ✅ Added comprehensive weather data (feels_like, wind_gust, visibility, precipitation)
 * ✅ Proper unit conversion and labeling
 * ✅ Added metadata for API usage tracking
 * 
 * QUERY PARAMETERS:
 * - city (required): City name to get weather for
 * - units (optional): 'metric' (default), 'imperial', or 'standard'
 * - lang (optional): Language code (default: 'en')
 * 
 * EXAMPLE USAGE:
 * /api/weather?city=London&units=metric&lang=en
 * /api/weather?city=New York&units=imperial
 */

// You'll need to get a free API key from OpenWeatherMap
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const maxDuration = 60; 
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const units = searchParams.get('units') || 'metric'; // Support different unit systems
  const lang = searchParams.get('lang') || 'en'; // Support multiple languages

  // Validate required parameters
  if (!city) {
    return NextResponse.json(
      { 
        error: 'City parameter is required',
        code: 'MISSING_CITY_PARAMETER',
        documentation: 'Please provide a city name using the ?city=YourCity parameter'
      },
      { status: 400 }
    );
  }

  // Validate units parameter
  if (!['metric', 'imperial', 'standard'].includes(units)) {
    return NextResponse.json(
      {
        error: 'Invalid units parameter. Supported values: metric, imperial, standard',
        code: 'INVALID_UNITS_PARAMETER'
      },
      { status: 400 }
    );
  }

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'Weather API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch current weather data with optimized parameters (single API call)
    console.log('Base URL:', BASE_URL);
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=${units}&lang=${lang}`
    );

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json().catch(() => ({}));
      
      switch (weatherResponse.status) {
        case 404:
          return NextResponse.json(
            { error: 'City not found', code: 'CITY_NOT_FOUND' },
            { status: 404 }
          );
        case 401:
          return NextResponse.json(
            { error: 'Invalid API key', code: 'INVALID_API_KEY' },
            { status: 401 }
          );
        case 429:
          return NextResponse.json(
            { error: 'API rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
            { status: 429 }
          );
        default:
          return NextResponse.json(
            { error: errorData.message || 'Failed to fetch weather data', code: 'API_ERROR' },
            { status: weatherResponse.status }
          );
      }
    }

    const weatherData = await weatherResponse.json();

    // Calculate local time using timezone offset from weather API response (no additional API call needed)
    const utcTime = new Date();
    const localTimeMs = utcTime.getTime() + (weatherData.timezone * 1000);
    const localTime = new Date(localTimeMs);

    // Get unit labels based on the units parameter
    const getUnitLabels = (units: string) => {
      switch (units) {
        case 'imperial':
          return {
            temperature: '°F',
            windSpeed: 'mph',
            pressure: 'hPa',
            visibility: 'miles'
          };
        case 'standard':
          return {
            temperature: 'K',
            windSpeed: 'm/s',
            pressure: 'hPa',
            visibility: 'km'
          };
        default: // metric
          return {
            temperature: '°C',
            windSpeed: 'm/s',
            pressure: 'hPa',
            visibility: 'km'
          };
      }
    };

    const unitLabels = getUnitLabels(units);

    // Format the response data with enhanced information
    const formattedData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      tempMin: Math.round(weatherData.main.temp_min),
      tempMax: Math.round(weatherData.main.temp_max),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      seaLevel: weatherData.main.sea_level || null,
      groundLevel: weatherData.main.grnd_level || null,
      cloudCover: weatherData.clouds.all,
      visibility: weatherData.visibility ? 
        (units === 'imperial' ? 
          Math.round(weatherData.visibility / 1609.34 * 100) / 100 : // Convert to miles
          Math.round(weatherData.visibility / 1000 * 100) / 100) : null, // Convert to km
      localTime: localTime.toISOString(),
      localTimeFormatted: localTime.toLocaleString('en-US', { 
        timeZone: 'UTC',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      weather: {
        id: weatherData.weather[0].id,
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      },
      wind: {
        speed: Math.round((weatherData.wind?.speed || 0) * 100) / 100,
        direction: weatherData.wind?.deg || 0,
        gust: weatherData.wind?.gust ? Math.round(weatherData.wind.gust * 100) / 100 : null
      },
      precipitation: {
        rain: weatherData.rain ? {
          '1h': weatherData.rain['1h'] || 0,
          '3h': weatherData.rain['3h'] || null
        } : null,
        snow: weatherData.snow ? {
          '1h': weatherData.snow['1h'] || 0,
          '3h': weatherData.snow['3h'] || null
        } : null
      },
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
      },
      sun: {
        sunrise: new Date((weatherData.sys.sunrise + weatherData.timezone) * 1000).toISOString(),
        sunset: new Date((weatherData.sys.sunset + weatherData.timezone) * 1000).toISOString()
      },
      timezone: weatherData.timezone,
      dataTimestamp: new Date(weatherData.dt * 1000).toISOString(),
      units: {
        temperature: unitLabels.temperature,
        windSpeed: unitLabels.windSpeed,
        pressure: unitLabels.pressure,
        visibility: unitLabels.visibility,
        precipitation: 'mm'
      },
      meta: {
        requestedUnits: units,
        requestedLanguage: lang,
        apiCallsUsed: 1, // Optimized to use only 1 API call instead of 2
        source: 'OpenWeatherMap Current Weather API'
      }
    };

    return NextResponse.json(formattedData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}