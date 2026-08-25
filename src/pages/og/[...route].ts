// 빌드 타임에 글 제목으로 OpenGraph 썸네일 PNG를 생성한다.
// 글: /og/blog/<id>.png, 사이트 기본값: /og/site.png
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

const posts = await getCollection('blog');

const pages: Record<string, { title: string; description: string }> = Object.fromEntries([
	['site', { title: SITE_TITLE, description: SITE_DESCRIPTION }],
	...posts.map((post) => [
		`blog/${post.id}`,
		{ title: post.data.title, description: post.data.description },
	]),
]);

export const { getStaticPaths, GET } = await OGImageRoute({
	pages,
	getImageOptions: (_path, page) => ({
		title: page.title,
		description: page.description,
		// 블로그 테마(종이 + 잉크 + 빨간펜)를 따른다. global.css의 --paper, --ink, --accent.
		bgGradient: [[255, 255, 255]],
		border: { color: [201, 75, 60], width: 20, side: 'inline-start' },
		padding: 72,
		font: {
			title: {
				size: 64,
				lineHeight: 1.35,
				weight: 'Bold',
				color: [26, 26, 28],
				families: ['IBM Plex Sans KR'],
			},
			description: {
				size: 30,
				lineHeight: 1.5,
				color: [90, 90, 96],
				families: ['IBM Plex Sans KR'],
			},
		},
		fonts: [
			'./src/assets/fonts/source/IBMPlexSansKR-Bold.ttf',
			'./src/assets/fonts/source/IBMPlexSansKR-Regular.ttf',
		],
	}),
});
