import { catchError, finalize } from 'rxjs/operators';
import { ConsultabdService } from './../service/consultabd.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';

export class CotacaoDataSource implements DataSource<any[]> {

  private cotacaoSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private retorno: DbExplorer.DbExplorer;

  constructor(private consultaDbService: ConsultabdService) {}

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
      return this.cotacaoSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.cotacaoSubject.complete();
      this.loadingSubject.complete();
  }

  loadCotacoes(query: string, token: string, courseId= 1, filter = '',
              sortDirection = 'asc', pageIndex = 0, pageSize = 3) {

      this.loadingSubject.next(true);

      this.consultaDbService.getConsulta(query, token).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(cotacao => {
        this.retorno = <DbExplorer.DbExplorer> cotacao;
        if (this.retorno.status === '3') {
          console.log('CotacaoDataSource - 34', this.retorno.statusMessage );
          this.consultaDbService.logout();
        } else {
          console.log('CotacaoDataSource - 34', JSON.stringify(this.retorno.responseBody.rows) );
        this.cotacaoSubject.next(this.retorno.responseBody.rows );
        }
    }      );
  }
}
