import { Component, Input } from '@angular/core';
import { PrevisaoClima } from '@core/models/previsao-clima.model';

@Component({
  selector: 'app-card-clima',
  templateUrl: './card-clima.component.html',
  styleUrls: ['./card-clima.component.scss'],
})
export class CardClimaComponent {
  @Input() previsao: PrevisaoClima | null = null;
  @Input() isFromFallback: boolean = false;

  getWeatherIcon(condicao: string): string {
    const condicaoBaixa = condicao.toLowerCase();
    if (condicaoBaixa.includes('chuva') || condicaoBaixa.includes('rain') || condicaoBaixa.includes('drizzle') || condicaoBaixa.includes('garoa')) return '🌧️';
    if (condicaoBaixa.includes('neve') || condicaoBaixa.includes('snow')) return '❄️';
    if (condicaoBaixa.includes('tempestade') || condicaoBaixa.includes('thunderstorm')) return '⛈️';
    if (condicaoBaixa.includes('nublado') || condicaoBaixa.includes('cloud') || condicaoBaixa.includes('overcast')) return '☁️';
    if (condicaoBaixa.includes('ensolarado') || condicaoBaixa.includes('clear') || condicaoBaixa.includes('sunny')) return '☀️';
    if (condicaoBaixa.includes('parcialmente') || condicaoBaixa.includes('partly') || condicaoBaixa.includes('few clouds')) return '⛅';
    if (condicaoBaixa.includes('neblina') || condicaoBaixa.includes('fog') || condicaoBaixa.includes('mist')) return '🌫️';
    return '🌤️';
  }
}
