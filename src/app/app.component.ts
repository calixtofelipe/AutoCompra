import { DicasComponent } from './components/dicas/dicas.component';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { User } from './models/user';
import { environment } from './../environments/environment';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: User;
  defaultDicas: boolean;
  descrEmp = ` | Solicitação de Cotação:  ${environment.nomecliente}`;
  constructor(
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog
) {
  this.authService.currentUser.subscribe(x => this.currentUser = x);
  const dicaDefault = sessionStorage.getItem('defaultDicas');
  if (!(dicaDefault === 'true')) {
    this.getDicas();
  }

}


logout() {
  this.authService.logout();
  this.router.navigate(['cotacaoAdm/login']);
}

getDicas() {
  const dialogRef = this.dialog.open(DicasComponent, {data: {defaultDicas: this.defaultDicas}});

  dialogRef.afterClosed().subscribe(result => {
    this.defaultDicas = result;
    // sessionStorage.getItem('defaultDicas')
    let retorno = 'true';
    if (this.defaultDicas) {
      retorno = 'true';
    } else {
      retorno = 'false';
    }
    sessionStorage.setItem('defaultDicas', retorno);
  });
}


}
