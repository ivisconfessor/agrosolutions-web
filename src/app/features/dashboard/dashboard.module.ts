import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxEchartsModule } from 'ngx-echarts';
import { DashboardComponent } from './dashboard.component';
import { CardTalhaoComponent } from './components/card-talhao/card-talhao.component';
import { GraficoSensoresComponent } from './components/grafico-sensores/grafico-sensores.component';
import { CardClimaComponent } from './components/card-clima/card-clima.component';
import { ListaAlertasComponent } from './components/lista-alertas/lista-alertas.component';
import { PainelPropriedadesComponent } from './components/painel-propriedades/painel-propriedades.component';
import { CadastroPropriedadeComponent } from './components/cadastro-propriedade/cadastro-propriedade.component';
import { AuthGuard } from '@core/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    CardTalhaoComponent,
    GraficoSensoresComponent,
    CardClimaComponent,
    ListaAlertasComponent,
    PainelPropriedadesComponent,
    CadastroPropriedadeComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), NgbModule, ReactiveFormsModule, FormsModule, NgxEchartsModule],
})
export class DashboardModule {}
