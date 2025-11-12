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

  async onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const enteredEmail = this.loginForm.value.email.trim().toLowerCase();
    this.isLoading = true;

    try {
      // Step 1: Check if email exists
      const exists = await this.authService.isEmailRegistered(enteredEmail);
      if (!exists) {
        this.isLoading = false;
        this.errorMessage = 'No user found with this email address.';
        return;
      }

      // Step 2: Check if disabled
      const isDisabled = await this.authService.isUserDisabled(enteredEmail);
      if (isDisabled) {debugger
        this.isLoading = false;
        this.errorMessage = 'Your account has been disabled. Please contact support.';
        return;
      }

      // Step 3: Send reset email
      await this.authService.sendPasswordResetEmail(enteredEmail);
      this.isLoading = false;
      this.errorMessage = '';
      this.router.navigate(['/authentication/signin']);
    } catch (error) {
      console.error('Forgot password error:', error);
      this.isLoading = false;
      this.errorMessage = 'Something went wrong. Please try again later.';
    }
  }

}
