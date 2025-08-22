import { Component } from '@angular/core';
import {CommonModule, Location, NgIf} from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
import { DealerService } from './add-dealer.service';

@Component({
  selector: 'app-add-dealer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './add-dealer.component.html',
  styleUrls: ['./add-dealer.component.scss']
})
export class AddDealerComponent {
  dealerForm!: UntypedFormGroup;
  dealers: any[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private dealerService: DealerService,
    private location: Location,
    private router: Router
  ) {
    this.initForm();
    this.loadDealers();
  }

  initForm() {
    this.dealerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
      division: ['', [Validators.required]],
      country: ['', [Validators.required]],
      town: ['', [Validators.required]],
      category: ['', [Validators.required]],
      outletType: ['', [Validators.required]],
      location: ['', [Validators.required]],
    });
  }

  submitForm() {
    if (this.dealerForm.valid) {
      this.dealerService.addDealer(this.dealerForm.value)
        .then(() => {
          console.log("✅ Dealer added successfully!");
          this.dealerForm.reset();
          this.router.navigate(['module/dealer-list']);
        })
        .catch(err => console.error(" Failed to add dealer:", err));
    }
  }

  loadDealers() {
    this.dealerService.getDealerList().subscribe(data => {
      this.dealers = data;
      console.log(" Dealers:", this.dealers);
    });
  }

  updateDealer(id: string, dealerData: any) {
    this.dealerService.updateDealer(id, dealerData)
      .then(() => console.log("✅ Dealer updated"))
      .catch(err => console.error(" Update failed:", err));
  }

  deleteDealer(id: string) {
    this.dealerService.deleteDealer(id)
      .then(() => console.log("✅ Dealer deleted"))
      .catch(err => console.error(" Delete failed:", err));
  }

  goBack() {
    this.location.back();
  }
}
