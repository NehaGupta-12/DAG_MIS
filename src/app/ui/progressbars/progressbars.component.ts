import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
@Component({
    selector: 'app-progressbars',
    templateUrl: './progressbars.component.html',
    styleUrls: ['./progressbars.component.scss'],
    imports: [MatProgressBarModule]
})
export class ProgressbarsComponent {
  breadscrums = [
    {
      title: 'Progress',
      items: ['UI'],
      active: 'Progress',
    },
  ];

  constructor() {
    //constructor
  }
}
