import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {CommonModule, NgClass} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
// import {AuthService} from "@core";
import { AuthService } from '../auth.service';
import {LoadingService} from "../../Services/loading.service";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    NgClass,
    MatButtonModule,
    CommonModule,
    MatProgressSpinner
  ]
})
export class ForgotPasswordComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  submitted = false;
  isLoading : boolean = false;
  errorMessage: string = '';
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService,
  ) { }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      // email: [
      //   '',
      //   [Validators.required, Validators.email, Validators.minLength(5)],
      // ],

      email: ['', [Validators.required, Validators.email]],
    });
  }
  get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  // onSubmit() {
  //   this.submitted = true;
  //   // stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   } else {
  //     this.router.navigate(['/dashboard/main']);
  //   }
  // }


  onSubmit() {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const enteredEmail = this.loginForm.value.email.trim();
    const registeredEmail = (this.authService.currentUserValue as any)?.email
      || localStorage.getItem('userEmail');

    if (!registeredEmail || enteredEmail.toLowerCase() !== registeredEmail.toLowerCase()) {
      this.errorMessage = 'Please enter your registered email address.';
      return;
    }


    this.isLoading = true;

    this.authService.sendPasswordResetEmail(enteredEmail)
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard/main']); // navigate only on success
      })
      .catch(() => {
        this.isLoading = false;
        this.errorMessage = 'Failed to send reset email. Please try again.';
      });
  }


}
