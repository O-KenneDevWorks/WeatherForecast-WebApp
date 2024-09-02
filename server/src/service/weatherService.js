import dotenv from 'dotenv';
dotenv.config();
// TODO: Define a class for the Weather object
class Weather {
}
// TODO: Complete the WeatherService class
class WeatherService extends Weather {
    constructor(cityName) {
        super();
        this.APIKey = 'fe8aa0a5362d18878a757333b7004e25'; // Maybe store this in a secretconfig and import?  Move this to the dotenv file and import
        this.baseUrl = `https://api.openweathermap.org`;
        this.cityName = cityName;
    }
    // TODO: Create fetchLocationData method
    async fetchLocationData(queryURL) {
        // queryURL = `api.openweathermap.org/data/2.5/weather?q=${this.cityName}&appid=${this.APIKey}`;
        const response = await fetch(queryURL);
        const parsedResponse = await response.json();
        return parsedResponse; // Do I really need return?  The function doesn't specify a return
    }
    // TODO: Create destructureLocationData method
    destructureLocationData(locationData) {
        const { long, lat } = locationData;
        return { long, lat };
    }
    // TODO: Create buildGeocodeQuery method 
    // TODO: This needs work
    buildGeocodeQuery() {
        return `${this.baseUrl}/data/2.5/weather?q=${this.cityName}&appid=${this.APIKey}`;
    }
    // TODO: Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        const { lat, long } = coordinates;
        return `${this.baseUrl}/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${this.APIKey}`;
    }
    // TODO: Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        const queryString = this.buildGeocodeQuery(); // Does this need await
        const response = await fetch(queryString);
        const parsedResponse = await response.json();
        return this.destructureLocationData(parsedResponse); // Return nothing if failed fetch
    }
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        const queryString = this.buildWeatherQuery(coordinates);
        const response = await fetch(queryString);
        return response;
    }
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const parsedResponse = response.json();
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) { }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        this.cityName = city;
    }
}
export default new WeatherService();
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
