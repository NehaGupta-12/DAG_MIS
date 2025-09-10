import {Component, Inject, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatDivider} from "@angular/material/divider";
import {MatCard} from "@angular/material/card";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {DatePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-grn-view',
  imports: [
    MatHeaderCell,
    MatColumnDef,
    MatDivider,
    MatTable,
    MatCard,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatProgressSpinner,
    DatePipe,
    MatIcon,
    MatButton,
    NgIf
  ],
  templateUrl: './grn-view.component.html',
  standalone: true,
  styleUrl: './grn-view.component.scss'
})
export class GrnViewComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<GrnViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }
ngOnInit() {
  console.log(this.data)
}

  close() {
    this.dialogRef.close();
  }


}
