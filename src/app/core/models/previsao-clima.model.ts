export interface ClimaAtual {
  temperatura: number;
  sensacaoTermica: number;
  umidade: number;
  condicao: string;
  icone: string;
}

export interface PrevisaoDia {
  data: string;
  tempMax: number;
  tempMin: number;
  condicao: string;
  icone: string;
}

export interface PrevisaoClima {
  atual: ClimaAtual;
  proximos5Dias: PrevisaoDia[];
}
