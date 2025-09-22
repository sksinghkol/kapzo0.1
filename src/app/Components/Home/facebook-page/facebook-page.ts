import { Component, AfterViewInit, OnInit } from '@angular/core';

declare var FB: any;

@Component({
  selector: 'app-facebook-page',
  imports: [],
  templateUrl: './facebook-page.html',
  styleUrl: './facebook-page.scss'
})
export class FacebookPage implements AfterViewInit, OnInit {

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src =
          'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0&appId=YOUR_APP_ID';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && typeof (window as any).FB !== 'undefined' && (window as any).FB.XFBML) {
      (window as any).FB.XFBML.parse();
    }
  }
}