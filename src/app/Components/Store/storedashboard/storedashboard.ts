import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Storemenu } from '../storemenu/storemenu';
@Component({
  selector: 'app-storedashboard',
  imports: [ RouterOutlet, Storemenu],
  templateUrl: './storedashboard.html',
  styleUrl: './storedashboard.scss'
})
export class Storedashboard {

}
