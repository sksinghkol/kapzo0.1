import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

// Components
import { Home } from './Components/Home/home/home';
import { HomeDashboard } from './Components/Home/home-dashboard/home-dashboard';
import { UserDashboard } from './Components/User/user-dashboard/user-dashboard';
import { Storelogin } from './Components/Store/storelogin/storelogin';
import { Userlogin } from './Components/Home/userlogin/userlogin';
import { Storedashboard } from './Components/Store/storedashboard/storedashboard';

export const routes: Routes = [

  // Public home
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },

  // Login page
  {
    path: 'login',
    component: Userlogin,
    pathMatch: 'full',
  },
   // Login page
  {
    path: 'Storelogin',
    component: Storelogin,
    pathMatch: 'full',
  },

  // Home Dashboard + its children
  {
    path: 'HomeDashboard',
    component: HomeDashboard,
    children: [
      {
        path: 'AboutUs',
        loadComponent: () =>
          import('./Components/Home/store-details/store-details').then(m => m.StoreDetails),
      },
      {
        path: 'Blog',
        loadComponent: () =>
          import('./Components/Home/blog/blog').then(m => m.Blog),
      },
      {
        path: 'Product',
        loadComponent: () =>
          import('./Components/Home/product/product').then(m => m.Product),
      },
      {
        path: 'YoutubeVideo',
        loadComponent: () =>
          import('./Components/Home/youtube-video/youtube-video').then(m => m.YoutubeVideo),
      },
      {
        path: 'FacebookPage',
        loadComponent: () =>
          import('./Components/Home/facebook-page/facebook-page').then(m => m.FacebookPage),
      },
      {
        path: 'HowWeWork',
        loadComponent: () =>
          import('./Components/Home/how-we-work/how-we-work').then(m => m.HowWeWork),
      },
      {
        path: 'GiftCard',
        loadComponent: () =>
          import('./Components/Home/gift-card/gift-card').then(m => m.GiftCard),
      },
      {
        path: 'Help',
        loadComponent: () =>
          import('./Components/Home/help/help').then(m => m.Help),
      },
      
    ],
  },

  // ✅ Protected User Dashboard (separate route, not inside HomeDashboard)
  {
    path: 'UserDashboard',
    component: UserDashboard,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./Components/User/user-home/user-home').then(m => m.UserHome),
      },
      {
        path: 'UserProfile',
        loadComponent: () =>
          import('./Components/User/user-profile/user-profile').then(m => m.UserProfile),
      },
       {
        path: 'AddStore',
        loadComponent: () =>
          import('./Components/Admin/store/store').then(m => m.Store),
      },
       {
        path: 'AddProduct',
        loadComponent: () =>
          import('./Components/Admin/product/product').then(m => m.Product),
      },
    ],
  },


  // ✅ Protected User Dashboard (separate route, not inside HomeDashboard)
  {
    path: 'StoreDashboard',
    component: Storedashboard,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./Components/Store/store-list/store-list').then(m => m.StoreList),
      },
      {
        path: 'UserProfile',
        loadComponent: () =>
          import('./Components/User/user-profile/user-profile').then(m => m.UserProfile),
      },
       {
        path: 'AddStore',
        loadComponent: () =>
          import('./Components/Store/addstore/addstore').then(m => m.Addstore),
      },
       {
        path: 'AddProduct',
        loadComponent: () =>
          import('./Components/Admin/product/product').then(m => m.Product),
      },
    ],
  },





  // Wildcard (redirect to home)
  {
    path: '**',
    redirectTo: '',
  },
];

