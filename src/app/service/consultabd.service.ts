import { User } from './../models/user';
import { AuxRequest } from './../utils/auxRequest';
import { AuthService } from './auth.service';
import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConsultabdService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {

  }

  getConsulta(query: string, token: string) {

    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json');
    // .append('Access-Control-Allow-Origin', '*');

   return  this.http.post<DbExplorer.DbExplorer>(`${environment.apiUrl}/xpto/service.sbr?
serviceName=xpto.executeQuery
&mgeSession=${token}
&outputType=json`,
   query, {headers, withCredentials: true} )
   .pipe(take(1));

  }

  enviaResposta(dados) {

    const headers = new HttpHeaders()
    .set('Content-Type', 'text/xml');
    console.log('consultadb- token', this.authService.currentUserValue.token );
    const bodyLogin = AuxRequest.sendAnswer(dados);
   return this.http.post(`${environment.apiUrl}/mge/service.sbr?serviceName=xpto.executeSTP
   &mgeSession=${this.authService.currentUserValue.token}`,
       bodyLogin, {headers, responseType: 'text'} )
       .pipe(take(1));

  }

  parseXml(xmlStr) {
    let result;
    const parser = require('xml2js');
    parser.Parser().parseString(xmlStr, (e, r) => {result = r; });
    return result;
  }

  logout() {
    this.authService.logout();
  }


}


