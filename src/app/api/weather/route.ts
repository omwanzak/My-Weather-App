import { NextRequest, NextResponse } from 'next/server';

// You'll need to get a free API key from OpenWeatherMap
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json(
      { error: 'City parameter is required' },
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
    // Fetch current weather data
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Get timezone information for local time
    const timezoneResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    let localTime = new Date().toISOString();
    
    if (timezoneResponse.ok) {
      const geoData = await timezoneResponse.json();
      if (geoData.length > 0) {
        // Calculate local time using timezone offset from weather data
        const utcTime = new Date();
        const localTimeMs = utcTime.getTime() + (weatherData.timezone * 1000);
        localTime = new Date(localTimeMs).toISOString();
      }
    }

    // Format the response data
    const formattedData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      cloudCover: weatherData.clouds.all,
      localTime: localTime,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
      },
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