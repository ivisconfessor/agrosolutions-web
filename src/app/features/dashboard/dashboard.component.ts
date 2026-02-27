import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';
import { Talhao, Propriedade } from '@core/models/propriedade.model';
import { LeituraSensor } from '@core/models/leitura-sensor.model';
import { Alerta } from '@core/models/alerta.model';
import { PrevisaoClima } from '@core/models/previsao-clima.model';
import { AuthService } from '@core/auth/services/auth.service';
import { PropriedadeService } from '@core/services/propriedade.service';
import { SensoresService } from '@core/services/sensores.service';
import { MonitoracaoService } from '@core/services/monitoracao.service';
import { ClimaService } from '@core/services/clima.service';

interface DadosTalhao {
  talhao: Talhao;
  leituras: LeituraSensor[];
  alertas: Alerta[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  propriedade!: Propriedade;
  talhoesComDados: DadosTalhao[] = [];
  clima: PrevisaoClima | null = null;
  climaDoFallback = false;
  talhaoSelecionadoIndex = 1; // Para ngbNav, começa em 1

  loading = true;
  erro = '';
  usuarioNome = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private propriedadeService: PropriedadeService,
    private sensoresService: SensoresService,
    private monitoracaoService: MonitoracaoService,
    private climaService: ClimaService,
    private router: Router,
  ) {
    this.usuarioNome = this.authService.currentUserValue?.nome || '';
  }

  ngOnInit(): void {
    this.carregarDados();
    // Auto-refresh a cada 5 minutos
    setInterval(() => this.recarregarDados(), 5 * 60 * 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDados(): void {
    this.loading = true;
    this.erro = '';

    const usuarioId = this.authService.currentUserValue?.id;
    if (!usuarioId) {
      this.erro = 'Usuário não identificado';
      this.loading = false;
      return;
    }

    console.log('[Dashboard] Iniciando carregamento de dados para usuário:', usuarioId);

    // Carregar propriedade (obtém todos os talhões)
    this.propriedadeService
      .getPropriedadesPorProdutor(usuarioId)
      .pipe(
        timeout(10000), // Timeout de 10 segundos
        takeUntil(this.destroy$),
      )
      .subscribe(
        (propriedades) => {
          console.log('[Dashboard] Propriedades carregadas:', propriedades);
          if (propriedades && propriedades.length > 0) {
            this.propriedade = propriedades[0];
            if (this.propriedade.talhoes && this.propriedade.talhoes.length > 0) {
              this.carregarDadosTodosTalhoes();
            } else {
              this.erro = 'Nenhum talhão encontrado na propriedade';
              this.loading = false;
            }
          } else {
            this.erro = 'Nenhuma propriedade encontrada';
            this.loading = false;
          }
        },
        (error) => {
          console.error('[Dashboard] Erro ao carregar propriedade:', error);
          this.erro = 'Erro ao carregar propriedade: ' + (error?.message || 'Desconhecido');
          this.loading = false;
        },
      );
  }

  private carregarDadosTodosTalhoes(): void {
    // Resetar lista de talhões com dados
    this.talhoesComDados = [];

    // Determinar período: últimos 7 dias
    const dataFim = new Date();
    const dataInicio = new Date(dataFim.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dataInicioStr = this.formatDate(dataInicio);
    const dataFimStr = this.formatDate(dataFim);

    // Se não há talhões, termina
    if (!this.propriedade.talhoes || this.propriedade.talhoes.length === 0) {
      this.loading = false;
      return;
    }

    // Criar promessas para cada talhão
    const promessas: Promise<any>[] = [this.carregarClima()];

    // Para cada talhão, carregar seus dados
    for (const talhao of this.propriedade.talhoes) {
      promessas.push(this.carregarDadosTalhao(talhao, dataInicioStr, dataFimStr));
    }

    Promise.all(promessas)
      .then(() => {
        this.loading = false;
      })
      .catch((error) => {
        if (!this.erro) {
          this.erro = 'Erro ao carregar dados';
        }
        this.loading = false;
      });
  }

  private carregarDadosTalhao(talhao: Talhao, dataInicio: string, dataFim: string): Promise<void> {
    return new Promise((resolve) => {
      const promessas = [
        this.carregarLeiturasTalhao(talhao.idTalhao, dataInicio, dataFim),
        this.carregarAlertasTalhao(talhao.idTalhao),
      ];

      Promise.all(promessas)
        .then(([leituras, alertas]) => {
          this.talhoesComDados.push({
            talhao,
            leituras: leituras as LeituraSensor[],
            alertas: alertas as Alerta[],
          });
          resolve();
        })
        .catch((error) => {
          console.error('[Dashboard] Erro ao carregar dados do talhão:', talhao.idTalhao, error);
          // Adiciona talhão com dados vazios para não quebrar a interface
          this.talhoesComDados.push({
            talhao,
            leituras: [],
            alertas: [],
          });
          resolve();
        });
    });
  }

  private carregarLeiturasTalhao(idTalhao: string, dataInicio: string, dataFim: string): Promise<LeituraSensor[]> {
    return new Promise((resolve) => {
      this.sensoresService
        .getLeituras(idTalhao, dataInicio, dataFim)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$),
        )
        .subscribe(
          (leituras) => {
            console.log('[Dashboard] Leituras carregadas para talhão:', idTalhao, leituras.length);
            resolve(leituras);
          },
          (error) => {
            console.error('[Dashboard] Erro ao carregar leituras do talhão:', idTalhao, error);
            resolve([]); // Retorna array vazio em caso de erro
          },
        );
    });
  }

  private carregarAlertasTalhao(idTalhao: string): Promise<Alerta[]> {
    return new Promise((resolve) => {
      this.monitoracaoService
        .getAlertas(idTalhao)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$),
        )
        .subscribe(
          (alertas) => {
            console.log('[Dashboard] Alertas carregados para talhão:', idTalhao, alertas.length);
            resolve(alertas);
          },
          (error) => {
            console.error('[Dashboard] Erro ao carregar alertas do talhão:', idTalhao, error);
            resolve([]); // Retorna array vazio em caso de erro
          },
        );
    });
  }

  private carregarClima(): Promise<void> {
    return new Promise((resolve) => {
      // Coordenadas padrão (será substituído por coordenadas reais do talhão se disponível)
      const latitude = -9.396; // São Paulo região
      const longitude = -51.456;

      console.log('[Dashboard] Iniciando carregamento de clima para coordenadas:', latitude, longitude);

      this.climaService
        .getPrevisaoClima(latitude, longitude)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$),
        )
        .subscribe(
          (clima) => {
            console.log('[Dashboard] Clima carregado com sucesso:', clima);
            this.clima = clima;
            resolve();
          },
          (error) => {
            console.error('[Dashboard] Erro ao carregar clima:', error);
            // Não bloqueia carregamento de outros dados
            this.clima = null;
            resolve();
          },
        );
    });
  }

  resolverAlerta(id: string): void {
    this.monitoracaoService
      .resolverAlerta(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          // Remove alerta de todos os talhões
          for (const dados of this.talhoesComDados) {
            dados.alertas = dados.alertas.filter((a) => a.id !== id);
          }
        },
        (error) => {
          console.error('Erro ao resolver alerta:', error);
          alert('Erro ao resolver alerta');
        },
      );
  }

  private recarregarDados(): void {
    this.carregarDadosTodosTalhoes();
  }

  get talhaoSelecionado(): DadosTalhao | undefined {
    // ngbNav começa em 1, então subtrai 1 para obter o índice do array
    return this.talhoesComDados[this.talhaoSelecionadoIndex - 1];
  }

  recarregar(): void {
    this.carregarDados();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
