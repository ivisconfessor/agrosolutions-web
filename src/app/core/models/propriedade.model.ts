export interface Talhao {
  idTalhao: string;
  nome: string;
  cultura: string;
  areaHectares: number;
}

export interface Propriedade {
  idPropriedade: string;
  nome: string;
  talhoes: Talhao[];
}
