import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
    selector: 'app-preloaders',
    templateUrl: './preloaders.component.html',
    styleUrls: ['./preloaders.component.scss'],
    imports: [MatProgressSpinnerModule]
})
export class PreloadersComponent {
  breadscrums = [
    {
      title: 'Preloaders',
      items: ['UI'],
      active: 'Preloaders',
    },
  ];

  constructor() {
    //constructor
  }
}
