import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
    imports: [MatButtonModule]
})
export class InvoiceComponent {
  breadscrums = [
    {
      title: 'Invoice',
      items: ['Extra'],
      active: 'Invoice',
    },
  ];
  constructor() {
    //constructor
  }
}
