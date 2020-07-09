declare namespace DbExplorer {

interface DbExplorer {
  serviceName: string;
  status: string;
  responseBody: ResponseBody;
  statusMessage: string;

}

interface ResponseBody {
  fieldsMetadata: FieldsMetadataItem[];
  rows: any[] ;
  burstLimit: boolean;
  timeQuery: string;
  timeResultSet: string;
}

interface FieldsMetadataItem {
  name: string;
  description: string;
  userType: string;
  order: number;
}

interface Cotacao {
  linhasCotacao?: LinhasCotacao[];
  qtdparcelas?: number;
  intpagto?: number;
  vlrtotitens?: number;
  vlrfretetot?: number;
  hashcode?: string;
  nrounico?: number;
  altnegped?: string;
  }

  interface LinhasCotacao {
    nrounico?: number;
    sequencia?: number;
    codprod?: number;
    descrprod?: string;
    marca?: string;
    qtdcotada?: number;
    unidadeforn?: string;
    unidade?: string;
    observacao?: string;
    refforn?: string;
    descrforn?: string;
    imagem?: string;
    vlrcotado?: number;
    vlrfreteunit?: number;
    dtlimite?: string;
    motrejeicao?: string;
    sequencial?: number;
    obsforn?: string;
    valido?: boolean;
    prazomedio?: number;
    dtentregaini?: string;
    dtentrega?: string;
    qtdparcelas?: number;
    intpagto?: number;
    descrtipvenda?: string;
    descrtipvendaini?: string;
    dtentregaped?: string;
    descrtipvendaped?: string;
    descrtipvendapedini?: string;
    altneg?: string;
    altprzent?: string;
    vlrtotliq?: number;
    controle?: string;
  }

  interface Resposta {
    hashcode?: string;
    qtdparcelas?: number;
    intpagto?: number;
    vlrfretetot?: number;
    vlrtotitens?: number;
    altnegped?: string;
    dtentregaped?: string;
    linhasRespostas?: LinhasResposta[];

  }

  interface LinhasResposta {
    nrounico?: number;
    sequencia?: number;
    codprod?: number;
    refforn?: string;
    descrforn?: string;
    vlrcotado?: number;
    vlrfreteunit?: number;
    motrejeicao?: string;
    obsforn?: string;
    altneg?: string;
    dtentrega?: string;
    qtdparcelas?: number;
    intpagto?: number;
  }



}
