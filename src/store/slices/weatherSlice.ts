import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the weather data interface
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  cloudCover: number;
  localTime: string;
  description: string;
  icon: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

// Define the weather state interface
interface WeatherState {
  currentWeather: WeatherData | null;
  loading: boolean;
  error: string | null;
  searchHistory: string[];
}

// Initial state
const initialState: WeatherState = {
  currentWeather: null,
  loading: false,
  error: null,
  searchHistory: [],
};

// Async thunk for fetching weather data
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (city: string, { rejectWithValue }) => {
    try {
      // We'll implement the actual API call later
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      return data as WeatherData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  }
);

// Create the weather slice
const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const city = action.payload;
      // Remove if already exists and add to beginning
      state.searchHistory = [city, ...state.searchHistory.filter(c => c !== city)].slice(0, 10);
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload;
        state.error = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentWeather = null;
      });
  },
});

export const { clearError, addToSearchHistory, clearSearchHistory } = weatherSlice.actions;
export default weatherSlice.reducer;