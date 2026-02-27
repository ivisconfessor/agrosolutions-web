import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { PrevisaoClima, ClimaAtual, PrevisaoDia } from '@core/models/previsao-clima.model';

interface OpenWeatherCurrentResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp_max: number;
      temp_min: number;
    };
    weather: Array<{
      main: string;
      icon: string;
    }>;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class ClimaService {
  private apiUrl = environment.openWeatherMap.baseUrl;
  private apiKey = environment.openWeatherMap.apiKey;

  constructor(private http: HttpClient) {}

  getPrevisaoClima(latitude: number, longitude: number): Observable<PrevisaoClima> {
    const url = this.buildForecastUrl(latitude, longitude);
    console.log('[ClimaService] Chamando API OpenWeatherMap:', url);
    console.log('[ClimaService] API Key:', this.apiKey?.substring(0, 8) + '...');
    
    return this.http
      .get<{ current: OpenWeatherCurrentResponse; forecast: OpenWeatherForecastResponse }>(
        url,
      )
      .pipe(
        map((response) => ({
          atual: this.mapCurrentWeather(response.current),
          proximos5Dias: this.mapForecast(response.forecast),
        })),
        catchError((error) => {
          console.warn('[ClimaService] Erro ao chamar API OpenWeatherMap:', error.statusText || error.message);
          console.log('[ClimaService] Usando dados mockados para clima');
          // Retorna dados mockados em caso de erro (CORS, timeout, etc)
          return of(this.getMockClimaData());
        }),
      );
  }

  private buildForecastUrl(lat: number, lon: number): string {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'pt_br');

    return `${this.apiUrl}/forecast?${params.toString()}`;
  }

  private mapCurrentWeather(response: OpenWeatherCurrentResponse): ClimaAtual {
    return {
      temperatura: Math.round(response.main.temp),
      sensacaoTermica: Math.round(response.main.feels_like),
      umidade: response.main.humidity,
      condicao: this.traduzirCondicaoClima(response.weather[0]?.main || 'Desconhecido'),
      icone: response.weather[0]?.icon || '',
    };
  }

  private mapForecast(response: OpenWeatherForecastResponse): PrevisaoDia[] {
    // Get daily forecasts (filter to get one forecast per day)
    const dailyForecasts = new Map<string, OpenWeatherForecastResponse['list'][0]>();

    response.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, forecast);
      }
    });

    // Retorna apenas os próximos 3 dias (pulando o dia atual)
    return Array.from(dailyForecasts.values())
      .slice(1, 4)
      .map((forecast) => ({
        data: new Date(forecast.dt * 1000).toLocaleDateString('pt-BR'),
        tempMax: Math.round(forecast.main.temp_max),
        tempMin: Math.round(forecast.main.temp_min),
        condicao: this.traduzirCondicaoClima(forecast.weather[0]?.main || 'Desconhecido'),
        icone: forecast.weather[0]?.icon || '',
      }));
  }

  // Traduz condições de clima para português
  private traduzirCondicaoClima(condicao: string): string {
    const traducoes: { [key: string]: string } = {
      'Thunderstorm': 'Tempestade',
      'Drizzle': 'Garoa',
      'Rain': 'Chuva',
      'Snow': 'Neve',
      'Mist': 'Neblina',
      'Smoke': 'Fumaça',
      'Haze': 'Névoa',
      'Dust': 'Poeira',
      'Fog': 'Neblina',
      'Sand': 'Areia',
      'Ash': 'Cinza',
      'Squall': 'Rajada',
      'Tornado': 'Tornado',
      'Clear': 'Ensolarado',
      'Clouds': 'Nublado',
      'Cloudy': 'Nublado',
      'Partly cloudy': 'Parcialmente nublado',
      'Overcast clouds': 'Muito nublado',
      'Broken clouds': 'Parcialmente nublado',
      'Few clouds': 'Poucas nuvens',
      'Scattered clouds': 'Nuvens dispersas',
    };

    return traducoes[condicao] || condicao;
  }

  // Retorna dados mockados quando a API não está disponível (CORS)
  private getMockClimaData(): PrevisaoClima {
    const hoje = new Date();
    const diasSeguintes: PrevisaoDia[] = [];
    const condicoes = ['Ensolarado', 'Nublado', 'Parcialmente nublado', 'Chuvoso'];

    // Gera previsão para os próximos 3 dias (pulando o dia atual)
    for (let i = 1; i <= 3; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + i);
      diasSeguintes.push({
        data: data.toLocaleDateString('pt-BR'),
        tempMax: 26 + Math.floor(Math.random() * 6),
        tempMin: 18 + Math.floor(Math.random() * 5),
        condicao: condicoes[Math.floor(Math.random() * condicoes.length)],
        icone: '',
      });
    }

    return {
      atual: {
        temperatura: 25,
        sensacaoTermica: 27,
        umidade: 65,
        condicao: 'Parcialmente nublado',
        icone: '',
      },
      proximos5Dias: diasSeguintes,
    };
  }
}
