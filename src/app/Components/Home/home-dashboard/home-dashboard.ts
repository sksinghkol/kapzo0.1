import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeMenu } from '../home-menu/home-menu';

@Component({
  selector: 'app-home-dashboard',
  imports: [RouterOutlet,HomeMenu],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss'
})
export class HomeDashboard {

}
