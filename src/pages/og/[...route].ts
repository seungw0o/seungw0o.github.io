// 빌드 타임에 글 제목으로 OpenGraph 썸네일 PNG를 생성한다.
// 글: /og/blog/<id>.png, 사이트 기본값: /og/site.png
// 디자인은 블로그 테마를 따른다: 모눈종이 + 잉크 제목 + 형광펜 하이라이트
// + 빨간펜 보더 + 손글씨 서명 (global.css의 --paper, --ink, --highlight, --accent).
import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { SITE_TITLE } from '../../consts';

const plexBold = await readFile('./src/assets/fonts/source/IBMPlexSansKR-Bold.ttf');
const nanumPen = await readFile('./src/assets/fonts/source/NanumPenScript-Regular.ttf');

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	return [
		{ params: { route: 'site.png' }, props: { title: SITE_TITLE } },
		...posts.map((post) => ({
			params: { route: `blog/${post.id}.png` },
			props: { title: post.data.title },
		})),
	];
}

const GRID_LINE = 'rgba(0, 0, 0, 0.06)';

function card(title: string) {
	return {
		type: 'div',
		props: {
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				backgroundColor: '#ffffff',
				backgroundImage: `linear-gradient(to right, ${GRID_LINE} 2px, transparent 2px)`,
				backgroundSize: '44px 44px',
				borderLeft: '20px solid #c94b3c',
				fontFamily: 'IBM Plex Sans KR',
			},
			children: [
				{
					// 모눈의 가로선. satori는 다중 background를 지원하지 않아 겹쳐 그린다.
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							top: 0,
							left: 0,
							width: '1200px',
							height: '630px',
							backgroundImage: `linear-gradient(to bottom, ${GRID_LINE} 2px, transparent 2px)`,
							backgroundSize: '44px 44px',
						},
					},
				},
				{
					// satori는 box-decoration-break를 지원하지 않아 어절마다
					// 형광펜 배경을 가진 span으로 쪼개 이어 붙인다. 어절 사이
					// 간격은 span의 좌우 padding이 만들고 하이라이트도 이어진다.
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexWrap: 'wrap',
							alignContent: 'flex-start',
							rowGap: '22px',
							maxWidth: '940px',
							margin: '80px 80px',
							fontSize: '84px',
							lineHeight: 1.3,
							fontWeight: 700,
							color: '#1a1a1c',
						},
						children: title.split(' ').map((word) => ({
							type: 'span',
							props: {
								style: {
									backgroundImage:
										'linear-gradient(to bottom, transparent 62%, rgba(255, 228, 100, 0.55) 62%, rgba(255, 228, 100, 0.55) 94%, transparent 94%)',
									padding: '0 11px',
								},
								children: word,
							},
						})),
					},
				},
				{
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							right: '64px',
							bottom: '44px',
							fontFamily: 'Nanum Pen Script',
							fontSize: '54px',
							color: '#c94b3c',
							borderBottom: '4px solid #c94b3c',
							paddingBottom: '2px',
							transform: 'rotate(-2deg)',
						},
						children: 'seungw0o.dev',
					},
				},
			],
		},
	};
}

export const GET: APIRoute = async ({ props }) => {
	const svg = await satori(card((props as { title: string }).title), {
		width: 1200,
		height: 630,
		fonts: [
			{ name: 'IBM Plex Sans KR', data: plexBold, weight: 700, style: 'normal' },
			{ name: 'Nanum Pen Script', data: nanumPen, weight: 400, style: 'normal' },
		],
	});
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
