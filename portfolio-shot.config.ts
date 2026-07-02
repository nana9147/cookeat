import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'http://localhost:3000',

  output: './public/screenshots',

  pages: [
    {
      path: '/',
      name: 'home',
    },
    {
      path: '/login',
      name: 'login',
    },
    {
      path: '/register',
      name: 'register',
    },
    {
      path: '/recipes',
      name: 'recipes',
    },
    {
      path: '/recipes/6',
      name: 'recipe-detail',
    },
    {
      path: '/shopping',
      name: 'shopping',
    },
    {
      path: '/shopping/8',
      name: 'shopping-detail',
    },
    {
      path: '/search',
      name: 'search',
    },
    {
      path: '/admin/login',
      name: 'admin-login',
    },
  ],

  format: 'webp',

  quality: 90,

  fullPage: true,

  waitUntil: 'networkidle',
});
