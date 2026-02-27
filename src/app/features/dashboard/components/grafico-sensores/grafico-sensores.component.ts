import { delay } from 'rxjs/operators';
import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { LeituraSensor } from '@core/models/leitura-sensor.model';
import { SensoresService } from '@core/services/sensores.service';

declare const echarts: any;

@Component({
  selector: 'app-grafico-sensores',
  templateUrl: './grafico-sensores.component.html',
  styleUrls: ['./grafico-sensores.component.scss'],
})
export class GraficoSensoresComponent implements AfterViewInit, OnDestroy {
  @Input() leituras: LeituraSensor[] = [];

  option: any = {};
  private alive = true;

  constructor(
    private theme: NbThemeService,
    private sensoresService: SensoresService,
  ) {}

  ngAfterViewInit(): void {
    console.log('[GraficoSensores] ngAfterViewInit - Inicializando com', this.leituras.length, 'leituras');
    this.theme.getJsTheme()
      .pipe(delay(1))
      .subscribe(config => {
        this.generateChartConfig(config);
      });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  private generateChartConfig(config: any): void {
    const colors = config.variables;
    const chartData = this.prepareChartData();

    this.option = {
      color: ['#667eea', '#ff6b6b'],
      title: {
        text: 'Dados dos Sensores (Últimos 7 dias)',
        left: 'center',
        textStyle: {
          color: colors.textBasic,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: colors.tooltipLineColor,
          },
        },
        textStyle: {
          color: colors.textBasic,
        },
        backgroundColor: 'transparent',
        borderColor: colors.shadeLight,
        formatter: (params: any) => {
          if (Array.isArray(params)) {
            let result = params[0]?.axisValue + '<br/>';
            params.forEach((param: any) => {
              result += `<span style="color: ${param.color}">● ${param.name}: ${param.value}</span><br/>`;
            });
            return result;
          }
          return '';
        },
      },
      legend: {
        data: ['Umidade do Solo (%)', 'Temperatura (°C)'],
        textStyle: {
          color: colors.textBasic,
        },
        bottom: 0,
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.labels,
        axisLine: {
          lineStyle: {
            color: colors.shadeLight,
          },
        },
        axisLabel: {
          color: colors.textHint,
          fontSize: 12,
        },
        axisTick: {
          lineStyle: {
            color: colors.shadeLight,
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Umidade do Solo (%)',
          position: 'left',
          max: 100,
          axisLine: {
            lineStyle: {
              color: '#667eea',
            },
          },
          axisLabel: {
            color: colors.textHint,
            fontSize: 12,
            formatter: '{value}%',
          },
          splitLine: {
            lineStyle: {
              color: colors.shadeLight,
            },
          },
          nameTextStyle: {
            color: '#667eea',
            fontWeight: 'bold',
          },
        },
        {
          type: 'value',
          name: 'Temperatura (°C)',
          position: 'right',
          max: 50,
          axisLine: {
            lineStyle: {
              color: '#ff6b6b',
            },
          },
          axisLabel: {
            color: colors.textHint,
            fontSize: 12,
            formatter: '{value}°C',
          },
          splitLine: {
            show: false,
          },
          nameTextStyle: {
            color: '#ff6b6b',
            fontWeight: 'bold',
          },
        },
      ],
      series: [
        {
          name: 'Umidade do Solo (%)',
          type: 'line',
          data: chartData.umidade,
          smooth: true,
          yAxisIndex: 0,
          stroke: 2,
          itemStyle: {
            color: '#667eea',
          },
          areaStyle: {
            color: 'rgba(102, 126, 234, 0.2)',
          },
        },
        {
          name: 'Temperatura (°C)',
          type: 'line',
          data: chartData.temperatura,
          smooth: true,
          yAxisIndex: 1,
          stroke: 2,
          itemStyle: {
            color: '#ff6b6b',
          },
          areaStyle: {
            color: 'rgba(255, 107, 107, 0.2)',
          },
        },
      ],
    };

    console.log('[GraficoSensores] Gráfico configurado com sucesso:', this.option);
  }

  private prepareChartData(): any {
    // Filtra leituras válidas
    const leiturasValidas = this.leituras.filter(l => 
      typeof l.umidadeSolo === 'number' && 
      typeof l.temperatura === 'number' && 
      !isNaN(l.umidadeSolo) && 
      !isNaN(l.temperatura)
    );

    if (leiturasValidas.length === 0) {
      console.warn('[GraficoSensores] Nenhuma leitura válida');
      return { labels: [], umidade: [], temperatura: [] };
    }

    // Ordena por data
    const leiturasOrdenadas = [...leiturasValidas].sort((a, b) => 
      new Date(a.dataLeitura).getTime() - new Date(b.dataLeitura).getTime()
    );

    const labels = leiturasOrdenadas.map(l => {
      const date = new Date(l.dataLeitura);
      return date.toLocaleDateString('pt-BR', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    });

    const umidade = leiturasOrdenadas.map(l => l.umidadeSolo);
    const temperatura = leiturasOrdenadas.map(l => l.temperatura);

    console.log('[GraficoSensores] Dados preparados:', {
      registros: leiturasOrdenadas.length,
      umidade: umidade.length,
      temperatura: temperatura.length,
    });

    return { labels, umidade, temperatura };
  }
}
