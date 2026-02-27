import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Alerta } from '@core/models/alerta.model';

@Injectable({
  providedIn: 'root',
})
export class MonitoracaoService {
  private apiUrl = environment.apiUrls.monitoracao;

  constructor(private http: HttpClient) {}

  getAlertas(idTalhao: string, somenteAtivos: boolean = true, limite: number = 50): Observable<Alerta[]> {
    const params = new HttpParams()
      .set('idTalhao', idTalhao)
      .set('somenteAtivos', somenteAtivos.toString())
      .set('limite', limite.toString());

    return this.http.get<Alerta[]>(`${this.apiUrl}/alertas`, { params });
  }

  getAlerta(id: string): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/alertas/${id}`);
  }

  resolverAlerta(id: string): Observable<Alerta> {
    return this.http.post<Alerta>(`${this.apiUrl}/alertas/${id}/resolver`, {});
  }
}
