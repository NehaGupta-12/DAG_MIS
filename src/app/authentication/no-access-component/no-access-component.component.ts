import { Component } from '@angular/core';

@Component({
  selector: 'app-no-access-component',
  imports: [],
  template: `
    <div class="text-center mt-5">
      <h2>🚫 Access Denied</h2>
      <p>You don’t have permission to view this page.</p>
    </div>
  `,
  styleUrl: './no-access-component.component.scss'
})
export class NoAccessComponentComponent {

}
