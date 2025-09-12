import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
// import { AuthService } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import {LoadingService} from "../../Services/loading.service";
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    NgClass,
    MatButtonModule,
  ],
  standalone: true
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  loginForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  hidePassword = true;
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    // // Auto-redirect if already logged in
    // if (this.authService.currentUserValue?.token) {
    //   this.router.navigate(['/dashboard/main']);
    // }

    // Load saved credentials from registration (if any)
    const saved = JSON.parse(localStorage.getItem('tempLoginFill') || '{}');

    this.loginForm = this.formBuilder.group({
      email: [saved.email || '', [Validators.required, Validators.email]],
      password: [saved.password || '', Validators.required],
    });
  }
  get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      this.error = 'Username and Password not valid!';
      return;
    }

    // ✅ Start loader before login request
    this.loadingService.setLoading(true);

    this.authService
      .login(
        this.loginForm.value['email'],
        this.loginForm.value['password']
      )
      .then((res) => {
        // ✅ stop loader on success
        this.loadingService.setLoading(false);
        // Navigate after successful login
        this.router.navigate(['/dashboard/main']);
      })
      .catch((err) => {
        console.error('Login error:', err);
        this.error = 'Login failed. Please check your credentials.';
        // ✅ stop loader on error
        this.loadingService.setLoading(false);
      });
  }



}
