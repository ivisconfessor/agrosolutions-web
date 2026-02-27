import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PropriedadeService } from '@core/services/propriedade.service';

@Component({
  selector: 'app-cadastro-propriedade',
  templateUrl: './cadastro-propriedade.component.html',
  styleUrls: ['./cadastro-propriedade.component.scss'],
})
export class CadastroPropriedadeComponent implements OnInit {
  @Input() usuarioId!: string;

  form!: FormGroup;
  loading = false;
  erro = '';
  talhoesList: any[] = [{ nome: '', cultura: '', areaHectares: 0 }];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private propriedadeService: PropriedadeService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
    });
  }

  addTalhao(): void {
    this.talhoesList.push({ nome: '', cultura: '', areaHectares: 0 });
  }

  removeTalhao(index: number): void {
    this.talhoesList.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.invalid || this.talhoesList.length === 0) {
      this.erro = 'Preencha todos os campos obrigatórios e adicione pelo menos um talhão';
      return;
    }

    // Validar talhões
    const talhoesValidos = this.talhoesList.every(
      (t) => t.nome && t.cultura && t.areaHectares > 0,
    );
    if (!talhoesValidos) {
      this.erro = 'Todos os talhões devem ter nome, cultura e área maior que 0';
      return;
    }

    this.loading = true;
    this.erro = '';

    const payload = {
      idProdutor: this.usuarioId,
      nome: this.form.get('nome')?.value,
      descricao: this.form.get('descricao')?.value || '',
      talhoes: this.talhoesList,
    };

    console.log('[CadastroPropriedade] Enviando:', payload);

    this.propriedadeService.cadastrarPropriedade(payload).subscribe(
      (response) => {
        console.log('[CadastroPropriedade] Propriedade cadastrada:', response);
        this.loading = false;
        this.activeModal.close(response);
      },
      (error) => {
        console.error('[CadastroPropriedade] Erro:', error);
        this.erro = error?.error?.message || 'Erro ao cadastrar propriedade';
        this.loading = false;
      },
    );
  }

  fechar(): void {
    this.activeModal.dismiss('Cancel');
  }
}
