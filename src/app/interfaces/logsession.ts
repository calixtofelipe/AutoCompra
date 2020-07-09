declare namespace Logsession {

interface Logsession {
  serviceResponse?: ServiceResponse;
}

interface ServiceResponse {

  responseBody: ResponseBodyItem[];
    '$': {
        serviceName?: string;
        status?: number;
        pendingPrinting?: string;
        transactionId?: string;
        errorCode?: string;
        errorLevel?: string;
    };
    statusMessage?: string;
}

interface ResponseBodyItem {
  jsessionid?: string;
  idusu?: string;
  callID?: string;
}

}
