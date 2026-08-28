// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

/**
 * 마크다운 산출물 손보기.
 * - h2 내용을 span으로 감싼다. 형광펜 배경을 인라인 조각에 걸어야 줄바꿈되는 제목에서
 *   줄마다 텍스트 폭만큼만 칠해진다(h2 자체는 블록이라 조각으로 쪼개지지 않는다).
 * - 표를 가로 스크롤 래퍼에 넣는다. 좁은 화면에서 열이 눌리는 대신 스크롤되게.
 */
function rehypeProseFixes() {
	return (tree) => {
		const walk = (node) => {
			if (!Array.isArray(node.children)) return;
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				if (child.type !== 'element') continue;
				if (child.tagName === 'h2') {
					child.children = [
						{
							type: 'element',
							tagName: 'span',
							properties: { className: ['hl'] },
							children: child.children,
						},
					];
				} else if (child.tagName === 'table') {
					node.children[i] = {
						type: 'element',
						tagName: 'div',
						properties: { className: ['table-scroll'] },
						children: [child],
					};
				} else {
					walk(child);
				}
			}
		};
		walk(tree);
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://seungw0o.github.io',
	// 홈(/)이 글 목록을 직접 렌더한다. 예전에 공유된 /blog 링크만 살려둔다.
	// GitHub Pages는 301을 낼 수 없어 meta refresh 페이지가 생성되므로,
	// 사이트 안의 링크는 전부 /를 가리켜 이 페이지를 거치지 않게 한다.
	redirects: {
		'/blog': '/',
	},
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [rehypeProseFixes],
	},
});
