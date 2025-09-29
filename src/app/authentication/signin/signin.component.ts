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
import {NgClass, NgIf} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import {LoadingService} from "../../Services/loading.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSnackBar} from "@angular/material/snack-bar";
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
    MatProgressSpinnerModule,
    NgIf
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
  isLoading : boolean = false;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService,
    private matSnackBar : MatSnackBar
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

    this.isLoading = true;

    this.authService
      .login(this.loginForm.value['email'], this.loginForm.value['password'])
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard/main']);
      })
      .catch(() => {
        // No need to handle here anymore, service already shows snackbar
        this.isLoading = false;
      });
  }




}
