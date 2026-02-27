import { Component, Input } from '@angular/core';
import { Talhao } from '@core/models/propriedade.model';
import { LeituraSensor } from '@core/models/leitura-sensor.model';
import { Alerta } from '@core/models/alerta.model';

interface StatusTalhao {
  tipo: 'normal' | 'alerta' | 'risco';
  label: string;
  cor: string;
}

@Component({
  selector: 'app-card-talhao',
  templateUrl: './card-talhao.component.html',
  styleUrls: ['./card-talhao.component.scss'],
})
export class CardTalhaoComponent {
  @Input() talhao!: Talhao;
  @Input() leituraAtual: LeituraSensor | undefined;
  @Input() alertas: Alerta[] = [];

  get status(): StatusTalhao {
    if (!this.alertas || this.alertas.length === 0) {
      return { tipo: 'normal', label: 'Normal', cor: 'success' };
    }

    const tiposAlertas = this.alertas.map((a) => a.tipo);
    if (tiposAlertas.includes('Praga')) {
      return { tipo: 'risco', label: 'Risco de Praga', cor: 'danger' };
    }
    if (tiposAlertas.includes('Seca')) {
      return { tipo: 'alerta', label: 'Alerta de Seca', cor: 'warning' };
    }

    return { tipo: 'alerta', label: 'Alerta', cor: 'warning' };
  }

  get umidade(): number {
    return this.leituraAtual?.umidadeSolo ?? 0;
  }

  get temperatura(): number {
    return this.leituraAtual?.temperatura ?? 0;
  }

  get dataAtualizacao(): string {
    if (!this.leituraAtual) {
      return 'Sem dados';
    }
    const date = new Date(this.leituraAtual.dataLeitura);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
