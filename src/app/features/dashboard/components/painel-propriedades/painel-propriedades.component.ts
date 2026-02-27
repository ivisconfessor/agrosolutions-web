import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';
import { Propriedade } from '@core/models/propriedade.model';
import { AuthService } from '@core/auth/services/auth.service';
import { PropriedadeService } from '@core/services/propriedade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CadastroPropriedadeComponent } from '../cadastro-propriedade/cadastro-propriedade.component';

@Component({
  selector: 'app-painel-propriedades',
  templateUrl: './painel-propriedades.component.html',
  styleUrls: ['./painel-propriedades.component.scss'],
})
export class PainelPropriedadesComponent implements OnInit, OnDestroy {
  propriedades: Propriedade[] = [];
  loading = false;
  erro = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private propriedadeService: PropriedadeService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.carregarPropriedades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarPropriedades(): void {
    this.loading = true;
    this.erro = '';

    const usuarioId = this.authService.currentUserValue?.id;
    if (!usuarioId) {
      this.erro = 'Usuário não identificado';
      this.loading = false;
      return;
    }

    this.propriedadeService
      .getPropriedadesPorProdutor(usuarioId)
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (propriedades) => {
          this.propriedades = propriedades || [];
          console.log('[PainelPropriedades] Propriedades carregadas:', this.propriedades.length);
          this.loading = false;
        },
        (error) => {
          console.error('[PainelPropriedades] Erro ao carregar propriedades:', error);
          this.erro = 'Erro ao carregar propriedades';
          this.loading = false;
        },
      );
  }

  abrirCadastro(): void {
    const modalRef = this.modalService.open(CadastroPropriedadeComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.usuarioId = this.authService.currentUserValue?.id;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.carregarPropriedades();
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      },
    );
  }

  selecionarPropriedade(propriedade: Propriedade): void {
    // Pode ser usado para navegar ou exibir detalhes
    console.log('[PainelPropriedades] Propriedade selecionada:', propriedade.nome);
  }
}
