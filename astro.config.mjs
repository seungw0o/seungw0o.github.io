// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://seungw0o.github.io',
	redirects: {
		'/': '/blog',
	},
	integrations: [mdx(), sitemap()],
});
