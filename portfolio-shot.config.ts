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
      path: '/shopping',
      name: 'shopping',
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
