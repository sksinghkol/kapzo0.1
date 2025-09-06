import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-user-dashboard',
  imports: [RouterOutlet,UserMenu],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboard {

}
