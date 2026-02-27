import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Propriedade } from '@core/models/propriedade.model';

@Injectable({
  providedIn: 'root',
})
export class PropriedadeService {
  private apiUrl = environment.apiUrls.propriedade;

  constructor(private http: HttpClient) {}

  getPropriedade(id: string): Observable<Propriedade> {
    return this.http.get<Propriedade>(`${this.apiUrl}/propriedades/${id}`);
  }

  getPropriedadesPorProdutor(idProdutor: string): Observable<Propriedade[]> {
    return this.http.get<Propriedade[]>(`${this.apiUrl}/propriedades?idProdutor=${idProdutor}`);
  }

  cadastrarPropriedade(payload: any): Observable<Propriedade> {
    return this.http.post<Propriedade>(`${this.apiUrl}/propriedades`, payload);
  }
}
