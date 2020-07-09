import { User } from './../models/user';
import { AlertService } from 'src/app/service/alert.service';

import { AuthService } from './../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { takeUntil, take } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  private newUser: User = new User();
  unsubscribe$ = new Subject();
  // private usuario: User = new User();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
    ) {
      // redirect to home if already logged in
        // this.router.navigate(['/']);
   }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
  });
  // get return url from route parameters or default to '/'
          this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cotacaoAdm/semAcesso';
  }

      // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    // this.loading = true;
    this.authService.loginsnk(this.f.username.value, this.f.password.value)
    .pipe(take(1),
    takeUntil(this.unsubscribe$))
    .subscribe(
      data => {
        // console.log('auth.service 53 -subscribe data', data);
        // const parser = new DOMParser();
        // const xml = parser.parseFromString(data, 'text/xml');
        // const obj = this.ngxXml2jsonService.xmlToJson(xml);
        // console.log('retorno json',  JSON.stringify(data));
        // const logsession = <Logsession> this.ngxXml2jsonService.xmlToJson(xml);
        // console.log('auth.service 37 ', data);
        this.authService.logsession = <Logsession.Logsession> this.parseXml(data);
        // console.log('auth.service 38 ', JSON.stringify(this.logsession));

        if (this.authService.logsession.serviceResponse.responseBody === undefined) {
          const msg: string = this.authService.logsession.serviceResponse.statusMessage.toString().replace('a', '');
          // console.log('auth.service 63 - msg ', msg);
          this.alertService.error(atob(msg));
          this.loading = false;
          this.ngOnDestroy();
        } else {
          const tokenok: string = this.authService.logsession.serviceResponse.responseBody[0].jsessionid.toString().replace('a', '');
           console.log('auth.service 83 - session', tokenok);
          this.newUser.nomeusu = this.f.username.value;
          this.newUser.password = 'ok';
          this.newUser.token = tokenok;
          sessionStorage.setItem('currentUser',  JSON.stringify(this.newUser));
          this.authService.currentUserSubject.next(this.newUser);
          this.router.navigate([this.returnUrl]);
        }
      },
      error => {
          console.log('login.component - 84', 'entrou aqui ', error );
          this.alertService.error(error);
          this.loading = false;
          this.ngOnDestroy();
      });

      // After 1/2 second, subscribe again.
      setTimeout(() => {
        if (this.authService.logsession = null) {
          this.unsubscribe$.next();
          this.unsubscribe$.complete();
          this.alertService.error('Sem resposta do servidor!');
        }
      }, 10000);
  }

  parseXml(xmlStr) {
    let result;
    const parser = require('xml2js');
    parser.Parser().parseString(xmlStr, (e, r) => {result = r; });
    return result;
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.alertService.error('Sem Mensagem verificar com Cliente!');
    console.log('login componente foi destruído!');
  }

}
