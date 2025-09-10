import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatCard} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {DatePipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-daily-sale-view',
  imports: [
    MatIcon,
    MatCard,
    MatButton,
    DatePipe,
    NgIf
  ],
  templateUrl: './daily-sale-view.component.html',
  standalone: true,
  styleUrl: './daily-sale-view.component.scss'
})
export class DailySaleViewComponent {
  constructor(
    public dialogRef: MatDialogRef<DailySaleViewComponent>,
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
