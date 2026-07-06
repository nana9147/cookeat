import { defineConfig } from 'portfolio-shot';

const baseUrl = 'http://localhost:3000';

export default defineConfig({
  url: baseUrl,

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
      path: '/recipes/12',
      name: 'main/recipe-detail',
    },
    {
      path: '/recipes/write',
      name: 'main/recipe-write',
    },
    {
      path: '/recipes/12/edit',
      name: 'main/recipe-edit',
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

  auth: {
    login: {
      url: `${baseUrl}/login`,
      fields: [
        { selector: 'input[type="email"]', value: process.env.user! },
        { selector: 'input[type="password"]', value: process.env.password! },
      ],
      submitSelector: 'button[type="submit"]',
    },
  },
});
