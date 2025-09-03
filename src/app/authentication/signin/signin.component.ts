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
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  hidePassword: boolean = true;

  // ngOnInit() {
  //   this.loginForm = this.formBuilder.group({
  //     email: [
  //       'admin@daati.com',
  //       [Validators.required, Validators.email, Validators.minLength(5)],
  //     ],
  //     password: ['daati', Validators.required],
  //   });
  // }

  get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  // onSubmit() {
  //   this.submitted = true;
  //   this.error = '';
  //   if (this.loginForm.invalid) {
  //     this.error = 'Username and Password not valid !';
  //     return;
  //   } else {
  //     this.subs.sink = this.authService
  //       .login(this.form['email'].value, this.form['password'].value)
  //       .subscribe(
  //         (res) => {
  //           if (res) {
  //             const token = this.authService.currentUserValue.token;
  //             if (token) {
  //               this.router.navigate(['/dashboard/main']);
  //             }
  //           } else {
  //             this.error = 'Invalid Login';
  //           }
  //         },
  //         (error) => {
  //           this.error = error;
  //           this.submitted = false;
  //         }
  //       );
  //   }
  // }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      this.error = 'Username and Password not valid!';
      return;
    }

    this.authService
      .login(this.form['email'].value, this.form['password'].value)
      .subscribe(
        (res) => {
          if (res?.token) {
            this.router.navigate(['/dashboard/main']);
          } else {
            this.error = 'Invalid Login';
          }
        },
        (err) => {
          this.error = err.message;
          this.submitted = false;
        }
      );
  }

  ngOnInit() {
    // Auto-redirect if already logged in
    if (this.authService.currentUserValue?.token) {
      this.router.navigate(['/dashboard/main']);



    }

    // Load saved credentials from registration (if any)
    const saved = JSON.parse(localStorage.getItem('tempLoginFill') || '{}');

    this.loginForm = this.formBuilder.group({
      email: [saved.email || '', [Validators.required, Validators.email]],
      password: [saved.password || '', Validators.required],
    });
  }

}
