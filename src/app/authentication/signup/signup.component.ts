import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    NgClass,
    MatButtonModule,
  ]
})
export class SignupComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  submitted = false;
  hide = true;
  chide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      password: ['', Validators.required],
      cpassword: ['', Validators.required],
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
    this.submitted = true;
    if (this.loginForm.invalid) return;

    const { email, password, username } = this.loginForm.value;

    // Save user to localStorage
    localStorage.setItem('registeredUser', JSON.stringify({ email, password, username }));

    // Also save for auto-fill
    localStorage.setItem('tempLoginFill', JSON.stringify({ email, password }));

    // Redirect to login page
    this.router.navigate(['/authentication/signin']);
  }


}
