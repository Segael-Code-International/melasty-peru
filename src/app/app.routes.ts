import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component'),
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component'),
    },
    {
        path: 'products/:slug',
        loadComponent: () => import('./pages/product/product.component'),
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component'),
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component'),
    }
];
