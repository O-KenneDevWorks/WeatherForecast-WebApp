import dotenv from 'dotenv';
// import { ListFormat } from 'typescript';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  long: number;
  lat: number;
}

// TODO: Define a class for the Weather object
class Weather{
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
  APIKey: string;
  baseUrl: string;

  constructor(cityName: string) {
    // super()
    this.cityName = cityName
    this.APIKey = process.env.API_KEY || 'fe8aa0a5362d18878a757333b7004e25';
    this.baseUrl = process.env.API_BASE_URL || `https://api.openweathermap.org`;
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(queryURL: string) {
    // queryURL = `api.openweathermap.org/data/2.5/weather?q=${this.cityName}&appid=${this.APIKey}`;
    const response = await fetch(queryURL);
    const parsedResponse = await response.json();
    console.log(parsedResponse)
    return parsedResponse // Do I really need return?  The function doesn't specify a return
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const {long, lat} = locationData
    return {long, lat};
  }

  // TODO: Create buildGeocodeQuery method 
  // TODO: This needs work
  private buildGeocodeQuery(): string {
    return `${this.baseUrl}/geo/1.0/direct?q=${this.cityName},us&appid=${this.APIKey}`;
    
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const {lat, long} = coordinates;
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
    const coordinates = this.destructureLocationData({ lat: locationData.lat, long: locationData.lon });
    
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
      const forecast = this.buildForecastArray(currentWeather, weatherData.list.slice(1))
      console.log(forecast)
      return forecast
      // return this.buildForecastArray(currentWeather, weatherData.list.slice(1));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting weather for city:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error; // or return a default value or message
    }
  }
}

export default new WeatherService('');

// interface for coordinates
// {
// 	"coord": {
// 		"lon": -84.388,
// 		"lat": 33.749
// 	},
// 	"weather": [
// 		{
// 			"id": 800,
// 			"main": "Clear",
// 			"description": "clear sky",
// 			"icon": "01d"
// 		}
// 	],
// 	"base": "stations",
// 	"main": {
// 		"temp": 306.93,
// 		"feels_like": 307.28,
// 		"temp_min": 305.75,
// 		"temp_max": 308.71,
// 		"pressure": 1017,
// 		"humidity": 36,
// 		"sea_level": 1017,
// 		"grnd_level": 984
// 	},
// 	"visibility": 10000,
// 	"wind": {
// 		"speed": 3.09,
// 		"deg": 200
// 	},
// 	"clouds": {
// 		"all": 0
// 	},
// 	"dt": 1724794510,
// 	"sys": {
// 		"type": 2,
// 		"id": 2006620,
// 		"country": "US",
// 		"sunrise": 1724756908,
// 		"sunset": 1724803789
// 	},
// 	"timezone": -14400,
// 	"id": 4180439,
// 	"name": "Atlanta",
// 	"cod": 200
// }


// [
// 	{
// 		"name": "Atlanta",
// 		"local_names": {
// 			"oc": "Atlanta",
// 			"hy": "Ատլանտա",
// 			"ja": "アトランタ",
// 			"bo": "ཨ་ཊི་ལཱན་ཊཱ།",
// 			"ka": "ატლანტა",
// 			"eo": "Atlanta",
// 			"uk": "Атланта",
// 			"la": "Atlanta",
// 			"ko": "애틀랜타",
// 			"ht": "Atlanta",
// 			"he": "אטלנטה",
// 			"en": "Atlanta",
// 			"kn": "ಅಟ್ಲಾಂಟಾ, ಜಾರ್ಜಿಯಾ",
// 			"lt": "Atlanta",
// 			"ru": "Атланта",
// 			"mk": "Атланта",
// 			"ar": "أتلانتا، جورجيا",
// 			"sr": "Атланта",
// 			"ce": "Атланта",
// 			"pl": "Atlanta",
// 			"bg": "Атланта",
// 			"zh": "亚特兰大/亞特蘭大",
// 			"ta": "அட்லான்டா",
// 			"te": "అట్లాంటా",
// 			"el": "Ατλάντα",
// 			"mr": "अटलांटा",
// 			"ur": "اٹلانٹا، جارجیا",
// 			"th": "แอตแลนตา",
// 			"yi": "אטלאנטא",
// 			"os": "Атлантæ",
// 			"kw": "Atlanta",
// 			"be": "Атланта",
// 			"my": "အတ္တလန္တာမြို့",
// 			"fa": "آتلانتا",
// 			"gu": "એટલાન્ટા, જ્યોર્જિયા",
// 			"ml": "അറ്റ്ലാന്റാ നഗരം"
// 		},
// 		"lat": 33.7489924,
// 		"lon": -84.3902644,
// 		"country": "US",
// 		"state": "Georgia"
// 	}
// ]

























// {
// 	"cod": "200",
// 	"message": 0,
// 	"cnt": 5,
// 	"list": [
// 		{
// 			"dt": 1724932800,
// 			"main": {
// 				"temp": 296.85,
// 				"feels_like": 297.52,
// 				"temp_min": 296.85,
// 				"temp_max": 299.51,
// 				"pressure": 1020,
// 				"sea_level": 1020,
// 				"grnd_level": 987,
// 				"humidity": 86,
// 				"temp_kf": -2.66
// 			},
// 			"weather": [
// 				{
// 					"id": 800,
// 					"main": "Clear",
// 					"description": "clear sky",
// 					"icon": "01d"
// 				}
// 			],
// 			"clouds": {
// 				"all": 0
// 			},
// 			"wind": {
// 				"speed": 0.53,
// 				"deg": 270,
// 				"gust": 0.91
// 			},
// 			"visibility": 10000,
// 			"pop": 0,
// 			"sys": {
// 				"pod": "d"
// 			},
// 			"dt_txt": "2024-08-29 12:00:00"
// 		},
// 		{
// 			"dt": 1724943600,
// 			"main": {
// 				"temp": 299.8,
// 				"feels_like": 299.8,
// 				"temp_min": 299.8,
// 				"temp_max": 305.69,
// 				"pressure": 1020,
// 				"sea_level": 1020,
// 				"grnd_level": 987,
// 				"humidity": 71,
// 				"temp_kf": -5.89
// 			},
// 			"weather": [
// 				{
// 					"id": 800,
// 					"main": "Clear",
// 					"description": "clear sky",
// 					"icon": "01d"
// 				}
// 			],
// 			"clouds": {
// 				"all": 0
// 			},
// 			"wind": {
// 				"speed": 0.89,
// 				"deg": 181,
// 				"gust": 0.91
// 			},
// 			"visibility": 10000,
// 			"pop": 0,
// 			"sys": {
// 				"pod": "d"
// 			},
// 			"dt_txt": "2024-08-29 15:00:00"
// 		},
// 		{
// 			"dt": 1724954400,
// 			"main": {
// 				"temp": 305.26,
// 				"feels_like": 307.24,
// 				"temp_min": 305.26,
// 				"temp_max": 309.47,
// 				"pressure": 1019,
// 				"sea_level": 1019,
// 				"grnd_level": 986,
// 				"humidity": 48,
// 				"temp_kf": -4.21
// 			},
// 			"weather": [
// 				{
// 					"id": 800,
// 					"main": "Clear",
// 					"description": "clear sky",
// 					"icon": "01d"
// 				}
// 			],
// 			"clouds": {
// 				"all": 1
// 			},
// 			"wind": {
// 				"speed": 2.2,
// 				"deg": 143,
// 				"gust": 1.88
// 			},
// 			"visibility": 10000,
// 			"pop": 0,
// 			"sys": {
// 				"pod": "d"
// 			},
// 			"dt_txt": "2024-08-29 18:00:00"
// 		},
// 		{
// 			"dt": 1724965200,
// 			"main": {
// 				"temp": 308.98,
// 				"feels_like": 308.37,
// 				"temp_min": 308.98,
// 				"temp_max": 308.98,
// 				"pressure": 1017,
// 				"sea_level": 1017,
// 				"grnd_level": 984,
// 				"humidity": 27,
// 				"temp_kf": 0
// 			},
// 			"weather": [
// 				{
// 					"id": 803,
// 					"main": "Clouds",
// 					"description": "broken clouds",
// 					"icon": "04d"
// 				}
// 			],
// 			"clouds": {
// 				"all": 76
// 			},
// 			"wind": {
// 				"speed": 3.07,
// 				"deg": 180,
// 				"gust": 2.62
// 			},
// 			"visibility": 10000,
// 			"pop": 0,
// 			"sys": {
// 				"pod": "d"
// 			},
// 			"dt_txt": "2024-08-29 21:00:00"
// 		},
// 		{
// 			"dt": 1724976000,
// 			"main": {
// 				"temp": 305.77,
// 				"feels_like": 305.78,
// 				"temp_min": 305.77,
// 				"temp_max": 305.77,
// 				"pressure": 1017,
// 				"sea_level": 1017,
// 				"grnd_level": 984,
// 				"humidity": 37,
// 				"temp_kf": 0
// 			},
// 			"weather": [
// 				{
// 					"id": 803,
// 					"main": "Clouds",
// 					"description": "broken clouds",
// 					"icon": "04d"
// 				}
// 			],
// 			"clouds": {
// 				"all": 70
// 			},
// 			"wind": {
// 				"speed": 2.59,
// 				"deg": 229,
// 				"gust": 4.04
// 			},
// 			"visibility": 10000,
// 			"pop": 0,
// 			"sys": {
// 				"pod": "d"
// 			},
// 			"dt_txt": "2024-08-30 00:00:00"
// 		}
// 	],
// 	"city": {
// 		"id": 4180439,
// 		"name": "Atlanta",
// 		"coord": {
// 			"lat": 33.749,
// 			"lon": -84.388
// 		},
// 		"country": "US",
// 		"population": 420003,
// 		"timezone": -14400,
// 		"sunrise": 1724929791,
// 		"sunset": 1724976435
// 	}
// }