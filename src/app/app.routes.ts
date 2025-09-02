// src/app/routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { AuthGuard } from './core/services/auth-guard';
import { Home } from './Components/Home/home/home';
import { Signup } from './auth/signup/signup';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { UserDashboard } from './Components/User/user-dashboard/user-dashboard';
import { AdminDashboard } from './Components/Admin/admin-dashboard/admin-dashboard';
export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },

  {
    path: 'Signup',
    component: Signup,
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    pathMatch: 'full',
  },
{
  path: 'UserDashboard',
  component: UserDashboard,
  canActivateChild: [AuthGuard],   // or canActivate if you prefer
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./Components/User/user-home/user-home').then(m => m.UserHome)
    },
    {
      path: 'UserProfile',
      loadComponent: () =>
        import('./Components/User/user-profile/user-profile').then(m => m.UserProfile)
    },
    
  ]
}
,
{
  path: 'AdminDashboard',
  component: AdminDashboard,
  canActivateChild: [AuthGuard],   // or canActivate if you prefer
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./Components/Admin/admin-home/admin-home').then(m => m.AdminHome)
    },
    {
      path: 'AdminProfile',
      loadComponent: () =>
        import('./Components/Admin/admin-profile/admin-profile').then(m => m.AdminProfile)
    },
     {
      path: 'AdminCategory',
      loadComponent: () =>
        import('./Components/Admin/admin-category/admin-category').then(m => m.AdminCategory)
    },
     {
      path: 'AdminProduct',
      loadComponent: () =>
        import('./Components/Admin/admin-product/admin-product').then(m => m.AdminProduct)
    },
    {
      path: 'AdminColor',
      loadComponent: () =>
        import('./Components/Admin/admin-color/admin-color').then(m => m.AdminColor)
    },
     {
      path: 'AdminSize',
      loadComponent: () =>
        import('./Components/Admin/admin-size/admin-size').then(m => m.AdminSize)
    },
     {
      path: 'AdminProductVariant',
      loadComponent: () =>
        import('./Components/Admin/admin-product-variant/admin-product-variant').then(m => m.AdminProductVariant)
    },
     {
      path: 'AdminDeliveryLocation',
      loadComponent: () =>
        import('./Components/Admin/admin-delivery-location/admin-delivery-location').then(m => m.AdminDeliveryLocation)
    },
      {
      path: 'AdminProductImage',
      loadComponent: () =>
        import('./Components/Admin/admin-product-image/admin-product-image').then(m => m.AdminProductImage)
    },
     {
      path: 'AdminDeliveryTracking',
      loadComponent: () =>
        import('./Components/Admin/admin-delivery-tracking/admin-delivery-tracking').then(m => m.AdminDeliveryTracking)
    },
     {
      path: 'AdminInquiryReplies',
      loadComponent: () =>
        import('./Components/Admin/admin-inquiry-replies/admin-inquiry-replies').then(m => m.AdminInquiryReplies)
    },
     {
      path: 'AdminStoreDetails',
      loadComponent: () =>
        import('./Components/Admin/admin-store-details/admin-store-details').then(m => m.AdminStoreDetails)
    },
  ]
},


  {
    path: '**',
    redirectTo: '',
  },
];
