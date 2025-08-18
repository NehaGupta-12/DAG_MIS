import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
@Component({
    selector: 'app-list-group',
    templateUrl: './list-group.component.html',
    styleUrls: ['./list-group.component.scss'],
    imports: [MatListModule]
})
export class ListGroupComponent {
  typesOfShoes: string[] = [
    'Boots',
    'Clogs',
    'Loafers',
    'Moccasins',
    'Sneakers',
  ];

  breadscrums = [
    {
      title: 'List Group',
      items: ['UI'],
      active: 'List Group',
    },
  ];

  constructor() {
    //constructor
  }
}
