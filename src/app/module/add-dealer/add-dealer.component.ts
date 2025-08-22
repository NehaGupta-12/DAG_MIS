import { Component, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule, Location, NgIf, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
import { DealerService } from '../add-dealer.service';

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
    NgFor,   // ✅ for looping dealers
  ],
  templateUrl: './add-dealer.component.html',
  styleUrls: ['./add-dealer.component.scss']
})
export class AddDealerComponent {
  dealerForm!: UntypedFormGroup;
  dealers: any[] = [];   // ✅ store fetched dealers

  constructor(
    private fb: UntypedFormBuilder,
    private dealerService: DealerService,
    private injector: EnvironmentInjector,
    private location: Location,
    private router: Router
  ) {
    this.initForm();
    this.loadDealers();   // ✅ fetch list on init
  }

  // ✅ Initialize form
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

    console.log("🟢 Dealer form initialized:", this.dealerForm.value);
  }

  // ✅ Load dealers
  loadDealers() {
    console.log("🔵 Fetching dealer list...");
    runInInjectionContext(this.injector, () => {
      this.dealerService.getDealerList().subscribe({
        next: (data) => {
          this.dealers = data;
          console.log("📦 Dealers fetched:", this.dealers);
        },
        error: (err) => console.error("❌ Error loading dealers:", err),
      });
    });
  }

  // ✅ Add Dealer
  submitForm() {
    console.log("🟡 Submit button clicked. Form value:", this.dealerForm.value);

    if (this.dealerForm.valid) {
      runInInjectionContext(this.injector, () => {
        this.dealerService.addDealer(this.dealerForm.value)
          .then(() => {
            console.log("✅ Dealer added successfully:", this.dealerForm.value);
            this.dealerForm.reset();
            this.loadDealers();   // ✅ refresh list after adding
          })
          .catch(err => console.error("❌ Failed to add dealer:", err));
      });
    } else {
      console.warn("⚠️ Form is invalid. Current value:", this.dealerForm.value);
    }
  }

  // ✅ Update Dealer
  updateDealer(id: string, dealerData: any) {
    console.log(`🟠 Updating dealer with id=${id}`, dealerData);
    runInInjectionContext(this.injector, () => {
      this.dealerService.updateDealer(id, dealerData)
        .then(() => {
          console.log("✅ Dealer updated successfully!");
          this.loadDealers();
        })
        .catch(err => console.error("❌ Update failed:", err));
    });
  }

  // ✅ Delete Dealer
  deleteDealer(id: string) {
    console.log(`🔴 Deleting dealer with id=${id}`);
    runInInjectionContext(this.injector, () => {
      this.dealerService.deleteDealer(id)
        .then(() => {
          console.log("✅ Dealer deleted successfully!");
          this.loadDealers();
        })
        .catch(err => console.error("❌ Delete failed:", err));
    });
  }

  // ✅ Back Navigation
  goBack() {
    console.log("↩️ Back button clicked");
    this.location.back();
  }
}
