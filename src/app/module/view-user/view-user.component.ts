import {Component, EnvironmentInjector, OnInit, runInInjectionContext} from '@angular/core';
import { UserService } from "../add-user/user.service";
import { ActivatedRoute } from "@angular/router";
import { MatDividerModule } from "@angular/material/divider";
import { MatTableModule } from '@angular/material/table';
import { LoadingService } from 'app/Services/loading.service';
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss'],
  standalone: true,
  imports: [
    MatDividerModule,
    MatTableModule,
    ]
})
export class ViewUserComponent implements OnInit {
  userId: string | null = null;
  userData: any = null;

  displayedColumns: string[] = ['address', 'city', 'country', 'department', 'email', 'mobileNumber'];

  dataSource: { field: string; value: string }[] = [];

  constructor(private userService: UserService,
              private injector : EnvironmentInjector,
              private loadingService : LoadingService,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      runInInjectionContext(this.injector, () => {
        this.userService.getUserById(this.userId).subscribe((user: any) => {
          if (user) {
            this.userData = user;
          } else {
            console.warn('No user found with ID:', this.userId);
          }
        });
      });
    }
  }

}
