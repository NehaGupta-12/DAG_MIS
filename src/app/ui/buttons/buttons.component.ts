import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-buttons',
    templateUrl: './buttons.component.html',
    styleUrls: ['./buttons.component.scss'],
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
    ]
})
export class ButtonsComponent {
  breadscrums = [
    {
      title: 'Buttons',
      items: ['UI'],
      active: 'Buttons',
    },
  ];

  constructor() {
    // constructor
  }
}
