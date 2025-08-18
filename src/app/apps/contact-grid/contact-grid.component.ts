import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-contact-grid',
    templateUrl: './contact-grid.component.html',
    styleUrls: ['./contact-grid.component.scss'],
    imports: [MatButtonModule]
})
export class ContactGridComponent {
  breadscrums = [
    {
      title: 'Contact Grid',
      items: ['Apps'],
      active: 'Contact Grid',
    },
  ];
  constructor() {
    // constructor
  }
}
