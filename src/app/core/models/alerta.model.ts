export interface Alerta {
  id: string;
  idTalhao: string;
  tipo: string;
  mensagem: string;
  criadoEm: string;
  resolvidoEm?: string;
  status: 'Ativo' | 'Resolvido';
}
