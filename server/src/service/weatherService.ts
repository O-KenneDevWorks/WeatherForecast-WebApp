import dotenv from 'dotenv';
// import { ListFormat } from 'typescript';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  long: number;
  lat: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  tempF: string;
  windSpeed: string;
  humidity: string;
  icon: string;
  iconDescription: string;

  constructor(city: string, date: string, tempF: string, windSpeed: string, humidity: string, icon: string, iconDescription: string) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

interface WeatherData {
  list: {
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
  }[];
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  cityName: string;
  APIKey: string | undefined;
  baseUrl: string;

  constructor(cityName: string) {
    // super()
    this.cityName = cityName
    this.APIKey = process.env.API_KEY;
    this.baseUrl = process.env.API_BASE_URL || `https://api.openweathermap.org`;
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(queryURL: string) {
    try {
      const response = await fetch(queryURL);
      const parsedResponse = await response.json();

      // Check if the parsedResponse is an empty array or invalid
      if (!parsedResponse || parsedResponse.length === 0) {
        console.error('Failed to get valid location data:', parsedResponse || 'No response');
        throw new Error('Location Error: No data returned or invalid location');
      }

      return parsedResponse; // Return the parsed response if valid
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to fetch location data:', error.message || 'Unknown error');
      } else {
        console.error('Unexpected error:', error);
      }
      // Return a default value or handle the error appropriately
      throw error;
      // return { error: 'Unable to retrieve weather data' };
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { long, lat } = locationData
    return { long, lat };
  }

  // TODO: Create buildGeocodeQuery method 
  // TODO: This needs work
  private buildGeocodeQuery(): string {
    return `${this.baseUrl}/geo/1.0/direct?q=${this.cityName},us&appid=${this.APIKey}`;

  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, long } = coordinates;
    // May want to add units
    // TODO: add &cnt=5 for 5 day forecast
    return `${this.baseUrl}/data/2.5/forecast?lat=${lat}&lon=${long}&units=imperial&cnt=40&appid=${this.APIKey}`
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const queryString = this.buildGeocodeQuery();

    // Log the query string for debugging
    console.log('Geocode query string:', queryString);

    const response = await this.fetchLocationData(queryString);

    // Ensure the response is an array and contains at least one result
    if (!Array.isArray(response) || response.length === 0) {
      console.error('Failed to get valid location data:', response);
      throw new Error('Location Error: No data returned or invalid location');
    }

    // Assuming you want the first location in the array
    const locationData = response[0];

    // Destructure the latitude and longitude from the location data
    const coordinates = this.destructureLocationData({
      lat: locationData.lat,
      long: locationData.lon,
    });

    return coordinates;
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const queryString = this.buildWeatherQuery(coordinates);
    const response = await fetch(queryString);
    const weatherData: WeatherData = await response.json();
    return weatherData;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    if (!response.list || response.list.length === 0) {
      console.error('Incomplete weather data:', response); // Log the entire response
      throw new Error('Weather data is not available or is incomplete');
    }

    const weatherData = response.list[0]; // Assuming you want the first item
    const city = this.cityName;
    const date = weatherData.dt_txt.split(" ")[0];
    const temp = weatherData.main.temp.toString();
    const wind = weatherData.wind.speed.toString();
    const humidity = weatherData.main.humidity.toString();
    const icon = weatherData.weather[0].icon.toString();
    const iconDescription = weatherData.weather[0].description.toString();

    return new Weather(city, date, temp, wind, humidity, icon, iconDescription);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray: Weather[] = [];
    forecastArray.push(currentWeather);

    for (const data of weatherData) {
      // Check for start of new day and make sure it is not the current day.  
      // There may be a case when current weather and the first day in forecast are the same because we are splitting at midnight
      // It also could be that the final day is undefined because of this count
      // TODO: This needs to be verified
      if (data.dt_txt.split(" ")[1] == '00:00:00' && data.dt_txt.split(" ")[0] != currentWeather.date) {
        const weather = new Weather(
          this.cityName,
          data.dt_txt.split(" ")[0],
          data.main.temp.toString(),
          data.wind.speed.toString(),
          data.main.humidity.toString(),
          data.weather[0].icon,
          data.weather[0].description,
        );
        forecastArray.push(weather);
      }
    }

    return forecastArray;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;

    if (!this.cityName) {
      throw new Error('City name must be provided');
    }

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(currentWeather, weatherData.list.slice(1));
      console.log(forecast);
      return forecast;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting weather for city:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      // Return a default value or handle the error appropriately
      return { error: 'Unable to retrieve weather data' };
    }
  }
}

export default new WeatherService('');
