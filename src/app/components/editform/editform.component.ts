import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDatepicker, DateAdapter } from '@angular/material';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-editform',
  templateUrl: './editform.component.html',
  styleUrls: ['./editform.component.css']
})
export class EditformComponent implements OnInit {
  formulario: FormGroup;
  vlrUnitTemp = 0;
  vlrFreteTemp = 0;

  linkimagem = 'assets/images/sem-imagem.png';
  constructor(public dialogRef: MatDialogRef<EditformComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DbExplorer.LinhasCotacao,
    private formBuilder: FormBuilder) {
    if (data.imagem) {
      this.linkimagem = data.imagem;
    }



  }

  ngOnInit() {
    this.formulario = this.formBuilder.group({
      codprod: [this.data.codprod],
      controle: [this.data.controle],
      descrprod: [this.data.descrprod],
      marca: [this.data.marca],
      qtdcotada: [this.data.qtdcotada],
      unidadeforn: [this.data.unidadeforn],
      unidade: [this.data.unidade],
      observacao: [this.data.observacao],
      refforn: [this.data.refforn],
      descrforn: [this.data.descrforn],
      imagem: [this.linkimagem],
      vlrcotado: [this.data.vlrcotado],
      vlrfreteunit: [this.data.vlrfreteunit],
      dtlimite: [this.data.dtlimite],
      motrejeicao: [this.data.motrejeicao],
      sequencia: [this.data.sequencia],
      nrounico: [this.data.nrounico],
      sequencial: [this.data.sequencial],
      obsforn: [this.data.obsforn],
      dtentrega: [this.data.dtentrega], // moment.isMoment([11, 10, 2018])
      dtentregaini: [this.data.dtentregaini],
      qtdparcelas: [{ value: this.data.qtdparcelas, disabled: this.permAltTipNeg() }],
      intpagto: [{ value: this.data.intpagto, disabled: this.permAltTipNeg() }],
      descrtipvenda: [this.data.descrtipvenda],
      descrtipvendaini: [this.data.descrtipvendaini],
      altprzent: [this.data.altprzent],
      altneg: [this.data.altneg],
      valido: true,
      vlrtotliq: [(this.data.vlrcotado * this.data.qtdcotada) + this.data.vlrfreteunit]
    });
    // console.log('editform', this.formulario);

  }

  onSubmit(form) {
    console.log('editform', this.formulario);
  }

  /*
   validaForm(campo) {
     if (this.verificatouched(campo)) {
       console.log('editform', this.formulario.get('tipopgto').value);
     }

     console.log('editform-validaform', this.formulario.get('tipopgto').value);
     if (this.formulario.get('tipopgto').value ===  'Á vista') {
       this.formulario.get('qtdparcelas').disable();

     }
   } */

  isInvalid() {
    if (this.formulario.get('dtentrega').value === null || this.formulario.get('dtentrega').value === '') {
      return true;
    } else {
      const now = new Date();
      let dtformat = '';
      dtformat = formatDate(now, 'yyyyMMdd', 'en-US');
      let newtdinformada = this.formulario.get('dtentrega').value;
      newtdinformada = newtdinformada.substring(4, 8).concat(newtdinformada.substring(2, 4))
        .concat(newtdinformada.substring(0, 2));
        //  console.log('editform-validaform', this.formulario.get('vlrcotado').value,newtdinformada, dtformat);
        if (((this.formulario.get('vlrcotado').value > 0 && (newtdinformada >= dtformat))
        || (this.formulario.get('motrejeicao').value))) {
        if ((this.formulario.get('motrejeicao').value === 'Informar na Observação') && (!this.formulario.get('obsforn').value)) {

          return true;
        } else {

          return false;
        }

      }

      return true;
    }
  }

  onSalvar() {
    this.formulario.get('vlrtotliq').setValue((this.formulario.get('vlrcotado').value *
      this.formulario.get('qtdcotada').value) + this.formulario.get('vlrfreteunit').value);
    if (this.validaEntrega(this.data.dtentregaini, this.formulario.get('dtentrega').value)) {
      this.dialogRef.close(this.formulario.value);
    }
    /*
    if (this.formulario.get('vlrcotado').value > 0) {
      this.dialogRef.close(this.formulario.value);
    } */
  }


  onNoClick(): void {
    console.log('editform.component-87', this.data.dtentrega);
    console.log('editform.component-87', this.formulario.get('dtentrega').value);
    this.dialogRef.close();
  }

  validaEntrega(dtacordo: string, dtinformada: string) {
    let retorno = true;
    // console.log('editform.component-114', this.data.altprzent);
    if (this.data.altprzent === 'N') {
      if (dtacordo != null) {
        const newdtacordo = dtacordo.substring(4, 8).concat(dtacordo.substring(2, 4))
          .concat(dtacordo.substring(0, 2));

        const newdtacordoformat = dtacordo.substring(0, 2).concat('/').concat(dtacordo.substring(2, 4))
          .concat('/').concat(dtacordo.substring(4, 8));

        const newdtinformada = dtinformada.substring(4, 8).concat(dtinformada.substring(2, 4))
          .concat(dtinformada.substring(0, 2));
        // console.log('editform.component-114', newdtinformada);
        // console.log('editform.component-115', newdtacordo);
        if (Number(newdtinformada) > Number(newdtacordo)) {
          alert(`A data de entrega informada não pode ser maior que a data acordada: ${newdtacordoformat}.`);
          retorno = false;
        }
      } else {
        if (dtinformada == null) {
          alert(`A data de entrega deve ser preenchida`);
          retorno = false;
        }
      }
    } else {
      console.log('editform-130', dtinformada);
      if (dtinformada == null) {
        alert(`A data de entrega deve ser preenchida`);
        retorno = false;
      }
    }
    return retorno;
  }

  permAltTipNeg() {
    if (this.data.altneg === 'S') {
      return false;
    } else {
      return true;
    }
  }

  validaCondPgto() {
    // console.log('editform.component.ts-137', this.formulario.get('qtdparcelas').value);
    const qtdparcelas: number = Number(this.formulario.get('qtdparcelas').value);
    const intpagto: number = Number(this.formulario.get('intpagto').value);

    if (intpagto > 0 && qtdparcelas > 0) {
      if (qtdparcelas === 1 && intpagto <= 1) {
        this.formulario.get('descrtipvenda').setValue('Venda á vista.');
      } else if (qtdparcelas === 1 && intpagto > 1) {
        this.formulario.get('descrtipvenda').setValue(`Venda com ${this.formulario.get('intpagto').value} dias de prazo.`);
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
        this.formulario.get('descrtipvenda').setValue(descrtipvenda);
      }

    } else {
      this.formulario.get('descrtipvenda').setValue(this.data.descrtipvendaini);
    }

  }

  vlrTotLiq(vlrunit) {
    this.vlrUnitTemp = vlrunit;
    this.formulario.get('vlrtotliq').setValue((vlrunit * this.data.qtdcotada) + this.vlrFreteTemp);
  }

  vlrTotLiqFrete(vlrfrete) {
    this.vlrFreteTemp = vlrfrete;
    this.formulario.get('vlrtotliq').setValue((this.vlrUnitTemp * this.data.qtdcotada) + vlrfrete);
  }

}
