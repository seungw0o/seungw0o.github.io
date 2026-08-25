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
		// 제목만 크게 싣는다. 설명은 링크 미리보기 본문이 이미 보여준다.
		// CanvasKit은 한글을 글자 단위로 줄바꿈하므로, 어절 안 글자를
		// word joiner(U+2060)로 묶어 공백에서만 줄이 바뀌게 한다.
		title: page.title
			.split(' ')
			.map((word) => [...word].join('⁠'))
			.join(' '),
		// 블로그 테마(종이 + 잉크 + 빨간펜)를 따른다. global.css의 --paper, --ink, --accent.
		bgGradient: [[255, 255, 255]],
		border: { color: [201, 75, 60], width: 20, side: 'inline-start' },
		padding: 80,
		font: {
			title: {
				size: 88,
				lineHeight: 1.4,
				weight: 'Bold',
				color: [26, 26, 28],
				families: ['IBM Plex Sans KR'],
			},
		},
		fonts: ['./src/assets/fonts/source/IBMPlexSansKR-Bold.ttf'],
	}),
});
