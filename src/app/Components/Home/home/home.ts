import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeMenu } from '../home-menu/home-menu';

@Component({
  selector: 'app-home',
  imports: [RouterModule,HomeMenu],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
