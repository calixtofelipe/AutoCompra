import { Cotacao } from './../models/cotacao';
import { ExcelService } from './../service/excel.service';
import { AuxRequest } from './../utils/auxRequest';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/service/alert.service';
import { EditformComponent } from './../components/editform/editform.component';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { AuthGuard } from './../guards/auth.guard';
import { environment } from './../../environments/environment';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConsultabdService } from './../service/consultabd.service';
import { AuthService } from './../service/auth.service';
import { User } from '../models/user';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  private newUser: User = new User();
  private hashcode;
  private retorno: DbExplorer.DbExplorer;
  private cotacoes: DbExplorer.Cotacao = {};
  private retImport: any[];
  private arquivo: File;
  dataSource;
  // date = new FormControl(new Date());
  formresp: FormGroup;

  displayedColumns: string[] = [ 'star', 'codprod', 'descrprod', 'controle', 'refforn', 'descrforn', 'marca', 'dtlimite',
  'qtdcotada', 'unidade', 'vlrcotado', 'vlrfreteunit', 'vlrtotliq', 'observacao',
  'motrejeicao', 'status'];
  isLoading = true;
  isSemAcesso = false;
  // dados formulario
  linhaform: string;

  // resposta
  resposta: DbExplorer.Resposta = {};
    retornoresp: Logsession.Logsession;
    loadingresp = false;
    retornorespbo = false;
    error = false;
    messageError = '';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private dbSevice: ConsultabdService,
    private authGuard: AuthGuard,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private cd: ChangeDetectorRef) {
    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
    this.currentUser = user;
  });
  }
  private sort: MatSort;
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
   // this.dataSource.paginator = this.paginator;
   if (this.sort) {
    this.dataSource.sort = this.sort;
   }
  }

  ngOnInit() {

    this.startCotacao();
    this.formresp = this.formBuilder.group({
      qtdparcelas: ['', Validators.pattern('[1-9][0-9]{3}')],
      descrtipvenda: [''],
      intpagto: [''],
      vlrfretetot: [0.00],
      dtentrega: [''],
      altnegped: ['N'],
      valido: true,
      vlrpedidotot: [0.00],
      file: [null, Validators.required]
      });
            // this.formresp.get('intpagto').disable();
            // this.formresp.get('qtdparcelas').disable();

  }

  startCotacao() {
    this.hashcode = this.authGuard.hashcode;
    if (this.hashcode.length === 32) {
      this.authService.autologin()
      .pipe(take(1))
      .subscribe(
      data => {
        this.authService.logsession = <Logsession.Logsession> this.authService.parseXml(data);
        // console.log('auth.service 38 ', JSON.stringify(this.logsession));

        if (this.authService.logsession.serviceResponse.responseBody === undefined) {
          this.authService.logout();
        } else {
          // console.log('home.components 62', JSON.stringify(this.authService.logsession));
          const tokenok: string = this.authService.logsession.serviceResponse.responseBody[0].jsessionid.toString().replace('a', '');
          // console.log('auth.service 66 - session', tokenok);
          this.newUser.nomeusu = environment.perma;
          this.newUser.password = 'ok';
          this.newUser.token = tokenok;
          this.currentUser = this.newUser;
          sessionStorage.setItem('currentUser',  JSON.stringify(this.newUser));
          this.authService.currentUserSubject.next(this.newUser);

          this.loadDbCotacao();

        }
      },
      error => {
        if (error === 'Unknown Error') {
          error = 'Erro de conexão com o sistema, verificar com o cliente.';
         }
          console.log('login.component - 118', 'entrou aqui ', error.message );
          this.authService.logout();
           this.authService.returnSemAcesso(error);
           this.alertService.error(error);
      });
          } else {
            console.log('HomeComponent-124-retorno', this.authGuard.hashcode);
            this.authService.logout();
            this.authService.returnSemAcesso('Erro Desconhecido - contate cliente');
          }
  }


  loadDbCotacao() {

    const query = AuxRequest.getCotacao(this.hashcode);
        this.dbSevice.getConsulta(query, this.newUser.token).pipe(take(1)
      )
      .subscribe(cotacao => {
        this.retorno = <DbExplorer.DbExplorer> cotacao;
        if (this.retorno.status === '3') {
          this.isLoading = false;
          console.log('CotacaoDataSource - 34', this.retorno.statusMessage );
          this.dbSevice.logout();
        } else {
          // console.log('home.component.ts-146: ', this.retorno);
          if (this.retorno.responseBody.rows.length === 0) {
            this.authService.logout();
            this.authService.returnSemAcesso('Sem Cotações Pendentes');
          } else {
          this.mapString(this.retorno.responseBody.rows);
          this.isLoading = false;
          this.dataSource = new MatTableDataSource(this.cotacoes.linhasCotacao);
          this.setDataSourceAttributes();


          this.formresp.get('descrtipvenda').setValue(this.cotacoes.linhasCotacao[0].descrtipvenda);

          if (this.naoPermAltTipNeg()) {
            this.formresp.get('qtdparcelas').disable();
            this.formresp.get('intpagto').disable();
          }
          // this.formresp.get('qtdparcelas').setValue(this.cotacoes.linhasCotacao[0].qtdparcelas);
          // this.formresp.get('intpagto').setValue(this.cotacoes.linhasCotacao[0].intpagto);
          // this.getDtEntregaPed(this.cotacoes.linhasCotacao)
          this.formresp.get('dtentrega').setValue(this.getDtEntregaPed(this.cotacoes.linhasCotacao));
        }
        }
    }      );
}
  getDtEntregaPed(linhas: DbExplorer.LinhasCotacao[]) {
      let melhorDtEntrega = null;
      for (let i = 0; i < linhas.length; i++) {
        const dtentregaini = linhas[i].dtentrega;
        if (dtentregaini != null) {
        const dtajuste = Number(dtentregaini.substring(4, 8).concat(dtentregaini.substring(2, 4)).concat(dtentregaini.substring(0, 2)));
        if (melhorDtEntrega === null) {
          melhorDtEntrega = dtajuste;
        } else {
          if (dtajuste < melhorDtEntrega) {
            melhorDtEntrega = dtajuste;
          }
        }
      }
    }
      if (melhorDtEntrega != null) {
        const melhorRetorno = melhorDtEntrega.toString();
        console.log('home.component.ts', new Date(Number(melhorRetorno.substring(0, 4)), Number(melhorRetorno.substring(4, 6)),
        Number(melhorRetorno.substring(6, 8)) ), Number(melhorRetorno.substring(0, 4)), Number(melhorRetorno.substring(4, 6)),
        Number(melhorRetorno.substring(6, 8)) );
     return new Date(Number(melhorRetorno.substring(0, 4)), Number(melhorRetorno.substring(4, 6)) -  1,
     Number(melhorRetorno.substring(6, 8)) );
     // melhorRetorno.substring(6, 8).concat(melhorRetorno.substring(4, 6)).concat(melhorRetorno.substring(0, 4));
      } else {
        return null;
      }

  }

  getVlrTotPed(linhas: DbExplorer.LinhasCotacao[], frete: number) {
    let totgeral = 0;
    for (let i = 0; i < linhas.length; i++) {
      const qtdcotado: number = linhas[i].qtdcotada;
      const vlrcotado: number = linhas[i].vlrcotado;
      const vlrtotal: number = qtdcotado * vlrcotado;
      totgeral = totgeral + vlrtotal;
    }
    // console.log('home.component.ts-204', totgeral, 'frete', frete);
    totgeral = totgeral + frete;
    return totgeral;
  }

  getTotalCotado() {
    // this.cotacoes.map(t => t.qtdcotacao.reduce((acc, value) => acc + value, 0));
    let total;
    if (this.cotacoes.linhasCotacao.length > 0 ) {
      total = this.cotacoes.linhasCotacao.map(t => t.qtdcotada).reduce((acc, value) => acc + value, 0);
    }
    return total;
  }

  getTotalVlrCotado() {
    // this.cotacoes.map(t => t.qtdcotacao.reduce((acc, value) => acc + value, 0));
    let total: number;
    if (this.cotacoes.linhasCotacao.length > 0 ) {
      total = this.cotacoes.linhasCotacao.map(t => t.vlrcotado).reduce((acc, value) => acc + value, 0);
      total = Number(total.toFixed(2));
    }
    return total;
  }

  getTotalVlrFrete() {
    // this.cotacoes.map(t => t.qtdcotacao.reduce((acc, value) => acc + value, 0));
    let total: number;
    if (this.cotacoes.linhasCotacao.length > 0 ) {
      total = this.cotacoes.linhasCotacao.map(t => t.vlrfreteunit).reduce((acc, value) => acc + value, 0);
      total = Number(total.toFixed(2));
    }
    // console.log('home.component.ts', total, Number(this.formresp.get('vlroutros').value) );
    if (Number(this.formresp.get('vlrfretetot').value) > total) {
    this.formresp.get('vlrfretetot').setValue(total);
  }

    return total;
  }

  sendResposta(form) {
    console.log(form);
  }

  mapString(linhas: any[] ) {
    const novalinha: any[] = [];
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      novalinha.push({nrounico: linha[0], sequencia: linha[1], codprod: linha[2], descrprod: linha[3],
      marca: linha[4], qtdcotada: linha[5], unidade: linha[6], observacao: linha[7],
      refforn: linha[8], descrforn: linha[9], dtlimite: linha[10], sequencial: linha[11],
      vlrcotado: 0, imagem: linha[12], valido: false, motrejeicao: '', unidadeforn: linha[13],
     prazomedio: linha[14], descrtipvenda: linha[15], dtentrega: linha[16], dtentregaini: linha[16],
     dtentregaped: linha[17], descrvendaped: linha[18], intpagto: '', qtdparcelas: '', vlrfreteunit: 0,
     altprzent: linha[19], altneg: linha[20], descrtipvendaini: linha[15], descrtipvendapedini: linha[18],
    vlrtotliq: 0, controle: linha[21] });
    }
    this.cotacoes.linhasCotacao = novalinha;
    this.cotacoes.altnegped = this.cotacoes.linhasCotacao[0].altneg;
     // console.log('home.component-246 - COTACOES', novalinha);
  }

  openDialog(row) {
    const dialogRef = this.dialog.open(EditformComponent, {width: '80%', height: '80%',
    data: row });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editLinhaTable(result);
        this.formresp.get('vlrfretetot').setValue(this.getTotalVlrFrete());
        this.formresp.get('dtentrega').setValue(this.getDtEntregaPed(this.cotacoes.linhasCotacao));

      }
    });
  }

  linhaclicada(row) {
    // console.log('home.component-184 - linha clicada', row);
    this.linhaform = JSON.stringify(row);
  }

  editLinhaTable(formret) {
   const linha =  this.cotacoes.linhasCotacao[formret.sequencial - 1];
   this.cotacoes.linhasCotacao[formret.sequencial - 1] = formret;
   this.dataSource = new MatTableDataSource(this.cotacoes.linhasCotacao);
  }

  linhaValida (row) {
    console.log('home componente 203', row);
  }
  sucessoTotal() {
    // botao fica habilitado (invalid=false) se tiver um que é falso desabilita
    let retorno = false;
    if (this.cotacoes.linhasCotacao === undefined) {
      retorno = true;
    } else {
    if (this.cotacoes.linhasCotacao.length > 0 ) {
      this.cotacoes.linhasCotacao.map(t => {
        if (!t.valido) {
            retorno = true;
        }
      } );
    }

  }
   /*
    if (Number(this.formresp.get('vlroutros').value) > this.getTotalVlrFrete()) {
      retorno = true;
      this.alertService.error(`${Number(this.formresp.get('vlroutros').value)}
      O valor do frete total deve ser menor que o total dos fretes unitários!
      ${this.getTotalVlrFrete()}` );
    } */
    return retorno;
  }
 /*
  enviaResposta_popup() {
    this.cotacoes.hashcode = this.hashcode;
    this.cotacoes.intpagto = this.formresp.get('intpagto').value;
    this.cotacoes.qtdparcelas = this.formresp.get('qtdparcelas').value;
    this.cotacoes.vlrfretetot = this.formresp.get('vlrfretetot').value;
    this.cotacoes.vlrtotitens = this.getTotalVlrCotado();
    const dialogRefResp = this.dialog.open(EnviarespComponent, {width: '80%', height: '90%',
    data: this.cotacoes });

    dialogRefResp.afterClosed().subscribe(result => {
      if (result) {
        console.log('home-component-233', result);
        this.startCotacao();
      }
    });
  } */
  readXLSX() {
    if (this.arquivo !== undefined) {

    const fileReader = new FileReader();
    let arrayBuffer: any;
        fileReader.onload = () => {
            arrayBuffer = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = new Array();
            for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
            const bstr = arr.join('');
            const workbook = XLSX.read(bstr, {type: 'binary'});
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];

            this.retImport = XLSX.utils.sheet_to_json(worksheet, {raw: true});
            const now = new Date();
            let dtformat = '';
            let dtformat2 = '';
            dtformat = formatDate(now, 'yyyyMMdd', 'en-US');
            dtformat2 = formatDate(now, 'ddMMyyyy', 'en-US');
            for (let i = 0; i < this.retImport.length; i++ ) {
              const rowexcel = this.retImport[i];
              const sequencia: number = Number(rowexcel['Sequência']) - 1;
              if ((rowexcel['Dt.Entrega Item'] === undefined || rowexcel['Dt.Entrega Item'] === '') &&
              (!rowexcel['Motivo Rejeição'])) {
                alert(`O item na planilha deve ser apresentar data de entrega: ${rowexcel['Dt.Entrega Item']}.
                Verificar na planilha item descr.Cliente: ${rowexcel['Descr.Cliente']}`);
                return;
              } else {
              if ((((Number(rowexcel['Vlr.Cotado']) > 0) &&
              (this.excelDateToDate(rowexcel['Dt.Entrega Item'], 2) >= dtformat))
              || (rowexcel['Motivo Rejeição']))) {
              this.cotacoes.linhasCotacao[sequencia].vlrcotado = rowexcel['Vlr.Cotado'];
              this.cotacoes.linhasCotacao[sequencia].vlrtotliq = this.cotacoes.linhasCotacao[i].qtdcotada
              * Number(rowexcel['Vlr.Cotado']);
              console.log('home.component.ts 379', this.cotacoes.linhasCotacao[sequencia].dtentrega );
              if (this.cotacoes.linhasCotacao[0].altprzent === 'S' ||
              this.cotacoes.linhasCotacao[sequencia].dtentrega === null ) {
              this.cotacoes.linhasCotacao[sequencia].dtentrega = this.excelDateToDate(rowexcel['Dt.Entrega Item'], 1);
              }
              this.cotacoes.linhasCotacao[sequencia].refforn = rowexcel['Cód.Fornecedor'] !== undefined ? rowexcel['Cód.Fornecedor']
              : '';
              this.cotacoes.linhasCotacao[sequencia].descrforn = rowexcel['Descr.Produto p/ Fornec.'];
              this.cotacoes.linhasCotacao[sequencia].vlrfreteunit = rowexcel['Vlr.Frete.Item'];
              this.cotacoes.linhasCotacao[sequencia].motrejeicao = rowexcel['Motivo Rejeição'] !== '' ?
              'Informar na Observação' : '';
              this.cotacoes.linhasCotacao[sequencia].obsforn = rowexcel['Motivo Rejeição'] !== '' ?
               rowexcel['Motivo Rejeição'] + ' - ' + rowexcel['Observação'] : rowexcel['Observação'] !== undefined ?
               rowexcel['Observação'] : '';
              if (this.cotacoes.linhasCotacao[sequencia].altneg === 'S') {
                this.validaCondPgto(rowexcel['Qtd.Parcelas'], rowexcel['Interv.Pagto'], sequencia );
              }
                this.cotacoes.linhasCotacao[sequencia].valido = true;
              } else {
                alert(`O item na planilha deve ser cotado e com data de entrega maior que data atual ou rejeitado.
                Verificar na planilha item descr.Cliente: ${rowexcel['Descr.Cliente']}`);
                return;
              }
            }
            }
            const row1excel = this.retImport[0];

            this.cotacoes.vlrfretetot = row1excel['Vlr.Frete.Pedido'];
            console.log('home.component.ts-409', this.cotacoes.altnegped);
              if (this.cotacoes.altnegped === 'S') {

                this.validaCondPgtoPed(row1excel['Qtd.Parcelas p/ Pedido'], row1excel['Intervalo Pagto p/ Pedido'] );
                }
            if (this.cotacoes.vlrfretetot === 0) {
              this.formresp.get('vlrfretetot').setValue(this.getTotalVlrFrete());
            } else {
              this.formresp.get('vlrfretetot').setValue(this.cotacoes.vlrfretetot);
            }
            this.dataSource = new MatTableDataSource(this.cotacoes.linhasCotacao);
            console.log('home.component.ts-414', row1excel['Dt.Entrega Pedido']);
              if ((this.cotacoes.linhasCotacao[0].altprzent === 'S' ||
              this.cotacoes.linhasCotacao[0].dtentregaped === null) &&
              row1excel['Dt.Entrega Pedido'] !== '' ) {
              const dtexcel = this.excelDateToDate(row1excel['Dt.Entrega Pedido'], 1);
              this.formresp.get('dtentrega').setValue(dtexcel);
              } else {
                this.formresp.get('dtentrega').setValue(this.getDtEntregaPed(this.cotacoes.linhasCotacao));
              }

        };


        fileReader.readAsArrayBuffer(this.arquivo);

      }
    }

    onFileChange(evt: any) {
      console.log('home.component.ts-344', evt.target.files[0]);
      this.arquivo = evt.target.files[0];

    }

    excelDateToDate(serial: string, format: number) {
      const now = new Date();
      let serials: string = String(serial);
      serials = serials.replace('/', '').replace('/', '');
      let dataFormat: Date = now;
      let retorno = '';
      // console.log('home.component.ts-447', serials);
      if (serial !== undefined) {
      if (serials.length <= 7) {
        dataFormat = new Date((Number(serials) - (25567 + 1)) * 86400 * 1000);
      } else {
        dataFormat = new Date(serials.substring(2, 4).concat('-').concat(serials.substring(0, 2))
        .concat('-').concat(serials.substring(4, 8)));
      }
    }
    if (format === 1) {
      retorno = formatDate(dataFormat, 'ddMMyyyy', 'en-US');
    } else if (format === 2) {
      retorno = formatDate(dataFormat, 'yyyyMMdd', 'en-US');

    } else {

      if (serials === 'null') {
        retorno = formatDate(now, 'ddMMyyyy', 'en-US');
        retorno = retorno.substring(0, 2).concat('/').concat(retorno.substring(2, 4))
        .concat('/').concat(retorno.substring(4, 8));
      } else {
        retorno = serials.substring(0, 2).concat('/').concat(serials.substring(2, 4))
        .concat('/').concat(serials.substring(4, 8));
      }

      // console.log('home.component.ts-4', retorno);
    }
      return retorno;
    }

   /* onFileChange(evt: any) {
      /* wire up file reader
      this.cotacoes = this.excelService.importExcel(evt);
      console.log('home.component.ts', this.cotacoes);
    }*/

  exportAsXLSX() {
    const novalinha: any[] = [];
    for (let i = 0; i < this.cotacoes.linhasCotacao.length; i++) {
      const linha = this.cotacoes.linhasCotacao[i];
      const dtformat: string = String(linha.dtentregaini);
      const dtformatped: string = String(linha.dtentregaped);
      novalinha.push({'Sequência': i + 1, 'Descr.Cliente': linha.descrprod, 'Cód.Fornecedor': linha.refforn,
      'Descr.Produto p/ Fornec.': linha.descrforn, 'Marca': linha.marca, 'controle': linha.controle, 'Qtd.Cotada': linha.qtdcotada,
      'Vlr.Cotado': linha.vlrcotado, 'Vlr.Frete.Item': linha.vlrfreteunit, 'Dt.Entrega Item': this.excelDateToDate(dtformat, 3),
      'Observação do Cliente': linha.observacao,
      'Descr.Tipo Negociação': linha.descrtipvendaini, 'Interv.Pagto': linha.intpagto, 'Qtd.Parcelas': linha.qtdparcelas,
      'Motivo Rejeição': '', 'Dt.Limite.Retorno': linha.dtlimite, 'Vlr.Frete.Pedido': 0, 'Intervalo Pagto p/ Pedido': '',
      'Qtd.Parcelas p/ Pedido': '', 'Dt.Entrega Pedido': this.excelDateToDate(dtformatped, 3), 'Observação': ''
       });
    }

    this.excelService.exportAsExcelFile(novalinha, 'Modelo');
  }

  enviaResposta() {
    if (this.validaEntrega(this.cotacoes.linhasCotacao[0].dtentregaped, this.formresp.get('dtentrega').value)) {

    this.loadingresp = true;
    this.resposta.hashcode = this.hashcode;
    this.resposta.intpagto = Number(this.formresp.get('intpagto').value);
    this.resposta.qtdparcelas = Number(this.formresp.get('qtdparcelas').value);
    this.resposta.vlrfretetot = this.formresp.get('vlrfretetot').value;
    this.resposta.altnegped = this.cotacoes.altnegped;
    this.resposta.dtentregaped = formatDate(this.formresp.get('dtentrega').value, 'ddMMyyyy', 'en-US');
    this.resposta.vlrtotitens = this.getTotalVlrCotado();
    const novalinha: any[] = [];
    for (let i = 0; i < this.cotacoes.linhasCotacao.length; i++) {
      const linha: DbExplorer.LinhasResposta = {};
      linha.codprod = this.cotacoes.linhasCotacao[i].codprod;
      linha.refforn = this.cotacoes.linhasCotacao[i].refforn;
      linha.descrforn = this.cotacoes.linhasCotacao[i].descrforn;
      linha.sequencia = this.cotacoes.linhasCotacao[i].sequencia;
      linha.nrounico = this.cotacoes.linhasCotacao[i].nrounico;
      linha.obsforn = this.cotacoes.linhasCotacao[i].obsforn;
      linha.vlrcotado = this.cotacoes.linhasCotacao[i].vlrcotado;
      linha.vlrfreteunit = this.cotacoes.linhasCotacao[i].vlrfreteunit;
      linha.motrejeicao = this.cotacoes.linhasCotacao[i].motrejeicao;
      linha.dtentrega = this.cotacoes.linhasCotacao[i].dtentrega;
      linha.intpagto = Number(this.cotacoes.linhasCotacao[i].intpagto);
      linha.qtdparcelas = Number(this.cotacoes.linhasCotacao[i].qtdparcelas);
      linha.altneg = this.cotacoes.linhasCotacao[i].altneg;
      novalinha.push(linha);
    }
    this.resposta.linhasRespostas = novalinha;
    console.log('enviaresp-78', JSON.stringify(this.resposta));
    this.dbSevice.enviaResposta(JSON.stringify(this.resposta)).pipe(take(1))
    .subscribe(resposta => {

        this.retornoresp = this.dbSevice.parseXml(resposta);
        const msg: string = this.retornoresp.serviceResponse.statusMessage.toString();
          // console.log('auth.service 63 - msg ', msg);
          if (Number(this.retornoresp.serviceResponse.$.status) === 3) {
            console.log('enviaresp - 88:', this.retornoresp.serviceResponse.$.status,
            Number(this.retornoresp.serviceResponse.$.status));
            const autoAutentica = this.authService.autoAutentica();
            if (autoAutentica) {
              this.dbSevice.enviaResposta(JSON.stringify(this.resposta)).pipe(take(1))
              .subscribe(respaut => {
                this.retornoresp = this.dbSevice.parseXml(respaut);
                const msgaut: string = this.retornoresp.serviceResponse.statusMessage.toString();
                if (Number(this.retornoresp.serviceResponse.$.status) === 2 ) {
                  console.log('enviaresp - 94-2', atob(msg), 'status: ', msgaut );
                  this.loadingresp = false;
                  this.startCotacao();
                }
              });
            }
          } if (Number(this.retornoresp.serviceResponse.$.status) === 0) {

            this.loadingresp = false;
            this.error = true;
            this.messageError = atob(msg);
            console.log(this.retornoresp.serviceResponse.$.status, 'enviaresp - 374-1', this.messageError);
            this.alertService.error(this.messageError);
          } else {
            this.loadingresp = false;
            this.startCotacao();
            console.log('enviaresp - 112:', this.retornoresp.serviceResponse.$.status, Number(this.retornoresp.serviceResponse.$.status));
            console.log(this.retornoresp.serviceResponse.$.status, 'enviaresp - 113', 'status: ' , atob(msg));
          }

      });
    }
  }
 /*
  isInvalid() {
     if ((this.formresp.get('tipopagto').value === 'Á Prazo') && (((this.formresp.get('qtdparcelas').value === null)
     || (this.formresp.get('intpagto').value === null))
     || ((this.formresp.get('qtdparcelas').value === '')
     || (this.formresp.get('intpagto').value === '')))) {
       return true;
     } else {
       return false;
     }
   } */

   validaFrete(newValue) {
    // console.log('home.component 255', this.formresp.get('tipopagto'));
    //  if (this.formresp.get('tipopagto').touched) {
 /*
       if (this.formresp.get('tipopagto').value === 'Á vista') {
         this.formresp.get('qtdparcelas').disable();
         this.formresp.get('intpagto').disable();
       } else {
         this.formresp.get('qtdparcelas').enable();
         this.formresp.get('intpagto').enable();
       }
   //   }*/
    // console.log('home.components429', newValue);
    if (this.formresp.get('vlrfretetot').value > this.getTotalVlrFrete() ) {
      this.formresp.get('vlrpedidotot').setValue(this.getTotalVlrFrete());
      this.formresp.get('vlrpedidotot').setValue(this.getVlrTotPed(this.cotacoes.linhasCotacao,
        this.getTotalVlrFrete()));
    } else {
      this.formresp.get('vlrpedidotot').setValue(this.getVlrTotPed(this.cotacoes.linhasCotacao,
        newValue));
    }

   }

 onSubmit(form) {
   console.log('home.component', this.formresp);
 }

 onEnviarResposta() {
   console.log('home.component', this.formresp);
 }


  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  naoPermAltTipNeg() {

  if (this.cotacoes.linhasCotacao != null ) {
    if (this.cotacoes.linhasCotacao[0].altneg === 'S') {
       return false;
    } else {
      return true;
    }
  }
  }

  validaEntrega(dtacordo: string, dtinformada: string) {
    let retorno = true;
    // console.log('editform.component-114', this.data.altprzent);
  if (this.cotacoes.linhasCotacao[0].altprzent === 'N') {
    if (dtacordo != null) {
    const newdtacordo = dtacordo.substring(4, 8).concat(dtacordo.substring(2, 4))
      .concat(dtacordo.substring(0, 2));

      const newdtacordoformat = dtacordo.substring(0, 2).concat('/').concat(dtacordo.substring(2, 4))
      .concat('/').concat(dtacordo.substring(4, 8));
      // console.log('editform.component-114', dtinformada);
      const newdtinformada = formatDate(dtinformada, 'yyyyMMdd', 'en-US');
      // dtinformada.substring(4, 8).concat(dtinformada.substring(2, 4)).concat(dtinformada.substring(0, 2));
       console.log('editform.component-114', newdtinformada);
      // console.log('editform.component-115', newdtacordo);
      if (Number(newdtinformada) > Number(newdtacordo)) {
        alert(`A data de entrega informada não pode ser maior que a data acordada: ${newdtacordoformat}.`);
      retorno = false;
      }
    }
  }
    return retorno;
  }

  validaCondPgto(qtdparcelas: number, intpagto: number, linha: number) {
    // console.log('home.component.ts-459', qtdparcelas);
    this.cotacoes.linhasCotacao[linha].qtdparcelas = Number(qtdparcelas);
    this.cotacoes.linhasCotacao[linha].intpagto = Number(intpagto);
    if (intpagto > 0 && qtdparcelas > 0) {
      if (qtdparcelas === 1 && intpagto <= 1) {
        this.cotacoes.linhasCotacao[linha].descrtipvenda = 'Venda á vista.';
      } else if (qtdparcelas === 1 && intpagto > 1) {
        this.cotacoes.linhasCotacao[linha].descrtipvenda = `Venda com ${this.formresp.get('intpagto').value} dias de prazo.`;
      } else if (qtdparcelas > 1 && intpagto > 1) {
        let percvalor: number = 100 / qtdparcelas;
        percvalor = Number(percvalor.toFixed(2));
        let descrtipvenda = '';
        let prazosomado = intpagto;
        let separador = '';
        for (let i = 1; i <= qtdparcelas; i++) {
          if (descrtipvenda === '') {
            separador = '';
          } else {
            separador = ';';
          }
          descrtipvenda = `${descrtipvenda} ${separador} ${prazosomado} dias - Vlr.: ${percvalor}%`;
          prazosomado = prazosomado + intpagto;
        }
        this.cotacoes.linhasCotacao[linha].descrtipvenda = descrtipvenda;
      }

    } else {
      this.cotacoes.linhasCotacao[linha].descrtipvenda = this.cotacoes.linhasCotacao[linha].descrtipvendaini;
    }

  }

  validaCondPgtoPed(qtdparcelas: number, intpagto: number) {
    console.log('home.component.ts-459', qtdparcelas);
    if (qtdparcelas === undefined) {
     qtdparcelas = Number(this.formresp.get('qtdparcelas').value);
    intpagto = Number(this.formresp.get('intpagto').value);
  } else {
    this.formresp.get('qtdparcelas').setValue(qtdparcelas);
    this.formresp.get('intpagto').setValue(intpagto);
  }
    if (intpagto > 0 && qtdparcelas > 0) {
      if (qtdparcelas === 1 && intpagto <= 1) {
        this.formresp.get('descrtipvenda').setValue('Venda á vista.');
      } else if (qtdparcelas === 1 && intpagto > 1) {
        this.formresp.get('descrtipvenda').setValue(`Venda com ${this.formresp.get('intpagto').value} dias de prazo.`);
      } else if (qtdparcelas > 1 && intpagto > 1) {
        let percvalor: number = 100 / qtdparcelas;
        percvalor = Number(percvalor.toFixed(2));
        let descrtipvenda = '';
        let prazosomado = intpagto;
        let separador = '';
        for (let i = 1; i <= qtdparcelas; i++) {
          if (descrtipvenda === '') {
            separador = '';
          } else {
            separador = ';';
          }
          descrtipvenda = `${descrtipvenda} ${separador} ${prazosomado} dias - Vlr.: ${percvalor}%`;
          prazosomado = prazosomado + intpagto;
        }
        this.formresp.get('descrtipvenda').setValue(descrtipvenda);
      }

    } else {
      console.log('home.component.ts-459', this.cotacoes.linhasCotacao[0].descrtipvendapedini);
      this.formresp.get('descrtipvenda').setValue(this.cotacoes.linhasCotacao[0].descrtipvendapedini);
    }

  }

}




