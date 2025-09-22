// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavbar } from './Components/shared/main-navbar/main-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainNavbar, RouterOutlet],
  template: `<app-main-navbar></app-main-navbar><router-outlet></router-outlet>`
})
export class App {}
