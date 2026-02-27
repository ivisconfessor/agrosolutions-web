import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Alerta } from '@core/models/alerta.model';

@Component({
  selector: 'app-lista-alertas',
 templateUrl: './lista-alertas.component.html',
  styleUrls: ['./lista-alertas.component.scss'],
})
export class ListaAlertasComponent {
  @Input() alertas: Alerta[] = [];
  @Output() resolverAlerta = new EventEmitter<string>();
  resolvendo: string | null = null;

  getTipoBadgeClass(tipo: string): string {
    const tipoMinusculo = tipo.toLowerCase();
    if (tipoMinusculo.includes('seca')) return 'warning';
    if (tipoMinusculo.includes('praga')) return 'danger';
    return 'info';
  }

  formatarData(dataStr: string): string {
    const date = new Date(dataStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  onResolverAlerta(id: string): void {
    this.resolvendo = id;
    this.resolverAlerta.emit(id);
  }
}
