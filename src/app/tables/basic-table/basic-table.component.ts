import { Component } from '@angular/core';
@Component({
    selector: 'app-basic-table',
    templateUrl: './basic-table.component.html',
    styleUrls: ['./basic-table.component.scss'],
    standalone: true,
})
export class BasicTableComponent {
  breadscrums = [
    {
      title: 'Basic',
      items: ['Tables'],
      active: 'Basic',
    },
  ];
  constructor() {
    //constructor
  }
}
