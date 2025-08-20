import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}


  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  // LOGIN: validate from localStorage
  login(email: string , password: string): Observable<any> {
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser') || '{}');

    if (registeredUser.email === email && registeredUser.password === password) {
      const user = { email, token: 'mock-token' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user); // success
    } else {
      return throwError(() => new Error('Username or password is incorrect'));
    }
  }

  logout(): void {
    console.log('Inside logout service');

    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    this.currentUserSubject.next(null);

    this.router.navigateByUrl('/authentication/signin', { replaceUrl: true });
  }







}
