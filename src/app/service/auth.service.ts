import { take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  logsession: Logsession.Logsession;
  currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public loginsession: Logsession.Logsession;
  returnUrl: string;
  loading = false;
  newUser: User = new User();
  errorMessage = '';
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
    ) {
      this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')));
      this.currentUser = this.currentUserSubject.asObservable();
     }

     public get currentUserValue(): User {
      return this.currentUserSubject.value;
  }


  loginsnk(username: string, password: string) {

    const headers = new HttpHeaders()
    .set('Content-Type', 'text/xml');

    const bodyLogin = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <serviceRequest serviceName="xpto.login">
      <requestBody>
    <NOMUSU>${username}</NOMUSU><INTERNO>${password}</INTERNO>
    </requestBody>
    </serviceRequest>`;

   return  this.http.post(`${environment.apiUrl}/xpto/service.sbr?serviceName=xpto.login`,
       bodyLogin, {headers, responseType: 'text'} );

  }

  autologin() {

    const headers = new HttpHeaders()
    .set('Content-Type', 'text/xml');

    const bodyLogin = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <serviceRequest serviceName="xpto.login">
      <requestBody>
    <NOMUSU>${environment.perma}</NOMUSU><INTERNO>${environment.permb}</INTERNO>
    </requestBody>
    </serviceRequest>`;
   return this.http.post(`${environment.apiUrl}/xpto/service.sbr?serviceName=xpto.login`,
       bodyLogin, {headers, responseType: 'text'} );

  }

  autoAutentica() {
    let retorno = false;
    const headers = new HttpHeaders()
    .set('Content-Type', 'text/xml');

    const bodyLogin = `<?xml version="1.0" encoding="ISO-8859-1"?>
    <serviceRequest serviceName="xpto.login">
      <requestBody>
    <NOMUSU>${environment.perma}</NOMUSU><INTERNO>${environment.permb}</INTERNO>
    </requestBody>
    </serviceRequest>`;
    this.http.post(`${environment.apiUrl}/xpto/service.sbr?serviceName=MobileLoginSP.login`,
       bodyLogin, {headers, responseType: 'text'} )
       .pipe(take(1))
      .subscribe(
      data => {
        this.logsession = <Logsession.Logsession> this.parseXml(data);
        // console.log('auth.service 38 ', JSON.stringify(this.logsession));

        if (this.logsession.serviceResponse.responseBody === undefined) {
          this.logout();
        } else {
          console.log('home.components 62', JSON.stringify(this.logsession));
          const tokenok: string = this.logsession.serviceResponse.responseBody[0].jsessionid.toString().replace('a', '');
          // console.log('auth.service 66 - session', tokenok);
          this.newUser.nomeusu = environment.perma;
          this.newUser.password = 'ok';
          this.newUser.token = tokenok;
          sessionStorage.setItem('currentUser',  JSON.stringify(this.newUser));
          this.currentUserSubject.next(this.newUser);
          retorno = true;
        }
      },
      error => {
          console.log('login.component - 84', 'entrou aqui ', error.message );
          this.logout();
           this.returnSemAcesso(error);
      });

      return retorno;
    }

  logout() {
    // remove user from local storage to log user out
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
}

parseXml(xmlStr) {
  let result;
  const parser = require('xml2js');
  parser.Parser().parseString(xmlStr, (e, r) => {result = r; });
  return result;
}

  returnlogin() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cotacaoAdm/login';
    this.router.navigate([this.returnUrl]);
  }

  returnSemAcesso(error) {
    this.errorMessage = error;
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cotacaoAdm/semAcesso';
    this.router.navigate([this.returnUrl]);
  }



}
