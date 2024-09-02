import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Define a City class with name and id properties
class City {
  public id: string;
  public name: string;
  
  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  private filePath = path.join(__dirname, '../../db/db.json');

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return this.read();
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities = await this.read();
    const newCity = new City(city);
    cities.push(newCity);
    await this.write(cities);
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    let cities = await this.read();
    cities = cities.filter((city: City )=> city.id !== id);
    await this.write(cities);}
}

export default new HistoryService();
