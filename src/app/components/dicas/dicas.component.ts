import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, OnInit, Inject, Input } from '@angular/core';

export interface StatusDicas {
  defaultDicas: boolean;
}

@Component({
  selector: 'app-dicas',
  templateUrl: './dicas.component.html',
  styleUrls: ['./dicas.component.css']
})
export class DicasComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DicasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusDicas) {
     }

  ngOnInit() {
  }

  closeDicas() {
    console.log('dicas.component.ts', this.data.defaultDicas);
    this.dialogRef.close();
  }




}
