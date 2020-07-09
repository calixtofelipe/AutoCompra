export class AuxRequest {

  static sendAnswer(dados) {
    const string = `<serviceRequest serviceName="ActionButtonsSP.executeSTP"><requestBody>
    <stpCall actionID="5" procName="STP_GETRESPFORN_AUTOCOMPRA" rootEntity="CONFIGAC">
    <params>
    <param type="S" paramName="DADOS"><![CDATA[${dados}]]>
    </param>
    </params><rows><row><field fieldName="NROUNICO"><![CDATA[1]]></field></row></rows>
    </stpCall><clientEventList><clientEvent>br.com.sankhya.actionbutton.clientconfirm</clientEvent>
    </clientEventList></requestBody></serviceRequest>`;

      return string;
  }

  static getCotacao(dados) {
    const query = `{"serviceName": "DbExplorerSP.executeQuery",
"requestBody": {"sql": "SELECT NROUNICO, SEQUENCIA, CODPROD, DESCRPROD, MARCA,
QTDCOTADA, UNIDADE, OBSERVACAO, REFFORN, DESCRFORN,
DTLIMITE,ROWNUM AS SEQUENCIAL, ENDIMAGEM, UNIDADEFORN, PRAZOMEDIO, DESCRTIPVENDA, DTENTREGA,
DTENTREGAPED, DESCRVENDAPED, ALTPRZENT, ALTTIPNEG, CONTROLE
FROM VAC_COTACAO VAC
WHERE HASHPARAC(VAC.CODFORN)='${dados}'"}}`;

      return query;
  }




}
