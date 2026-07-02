import { defineConfig } from 'portfolio-shot';

export default defineConfig({
  url: 'http://localhost:3000',

  output: './public/screenshots',

  pages: [
    {
      path: '/',
      name: 'main/home',
    },
    {
      path: '/login',
      name: 'main/login',
    },
    {
      path: '/register',
      name: 'main/register',
    },
    {
      path: '/recipes',
      name: 'main/recipes',
    },
    {
      path: '/recipes/6',
      name: 'main/recipe-detail',
    },
    {
      path: '/shopping',
      name: 'main/shopping',
    },
    {
      path: '/shopping/8',
      name: 'main/shopping-detail',
    },
    {
      path: '/search',
      name: 'main/search',
    },
    {
      path: '/admin/login',
      name: 'admin/login',
    },
  ],

  format: 'webp',

  quality: 90,

  fullPage: true,

  waitUntil: 'networkidle',
});
