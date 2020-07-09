import { AuthService } from './../../service/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sem-acesso',
  templateUrl: './sem-acesso.component.html',
  styleUrls: ['./sem-acesso.component.css']
})
export class SemAcessoComponent implements OnInit {

  messageError = 'Sem cotações Pendentes';
  messageDetalhe = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {

    this.messageError = this.authService.errorMessage;
    if (this.messageError === 'Sem cotações Pendentes') {
      this.messageDetalhe = 'Não existe nenhuma cotação pendente para esse fornecedor.';
    } else if (this.authService.errorMessage === '') {
      this.messageError = 'Erro desconhecido, contate cliente.';
    }
    console.log('sem acesso:', this.authService.errorMessage);
    console.log('sem acesso:', this.messageError);
    console.log('sem acesso:', this.messageDetalhe);
  }

}
