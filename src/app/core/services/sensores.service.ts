import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LeituraSensor } from '@core/models/leitura-sensor.model';

@Injectable({
  providedIn: 'root',
})
export class SensoresService {
  private apiUrl = environment.apiUrls.sensores;

  constructor(private http: HttpClient) {}

  getLeituras(
    idTalhao: string,
    dataInicio: string,
    dataFim: string,
    limite: number = 100,
  ): Observable<LeituraSensor[]> {
    const params = new HttpParams()
      .set('idTalhao', idTalhao);

    return this.http.get<LeituraSensor[]>(`${this.apiUrl}/leituras`, { params });
  }

  getLeitura(id: string): Observable<LeituraSensor> {
    return this.http.get<LeituraSensor>(`${this.apiUrl}/leituras/${id}`);
  }
}
