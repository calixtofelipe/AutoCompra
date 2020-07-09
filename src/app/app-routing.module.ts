
import { SemAcessoComponent } from './components/sem-acesso/sem-acesso.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
{ path: 'cotacao/:hashcode', component: HomeComponent, canActivate: [AuthGuard] },
{ path: 'cotacaoAdm/login', component: LoginComponent },
{ path: 'cotacaoAdm/semAcesso', component: SemAcessoComponent },

// otherwise redirect to home
{ path: '**', redirectTo: 'cotacaoAdm/login' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
