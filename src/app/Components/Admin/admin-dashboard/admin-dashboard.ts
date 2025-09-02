import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminMenu } from '../admin-menu/admin-menu';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet,AdminMenu],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard {

}
