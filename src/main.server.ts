// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

export default function () {
  return bootstrapApplication(App, {
    providers: [
      provideHttpClient(withFetch()),
      provideRouter(routes),
    ],
  });
}
