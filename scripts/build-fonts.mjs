// 빌드 타임 폰트 서브셋 생성.
// src/ 아래 소스 파일의 모든 글자를 모아, 실제 쓰는 글자만 담은 woff2를
// 로컬 원본 TTF(src/assets/fonts/source/)에서 만들어 public/fonts/에 둔다.
// 산출물(@font-face CSS, preload manifest)은 커밋하지 않는다.
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const SOURCE_DIR = path.join(SRC, 'assets/fonts/source');
const OUT_DIR = path.join(ROOT, 'public/fonts');
const GENERATED_DIR = path.join(SRC, 'assets/fonts/generated');
const CSS_PATH = path.join(SRC, 'styles/fonts.generated.css');

// 소스 코드에 등장하지 않지만 런타임에 생성되는 글자.
// 날짜는 toLocaleDateString('ko-KR')가 "2026년 8월 21일"로 그린다.
const ALWAYS_INCLUDE = '년월일 0123456789“”‘’…·—–';

const TEXT_EXTENSIONS = new Set(['.mdx', '.md', '.astro', '.ts', '.js', '.mjs', '.css', '.json']);

const FONTS = [
	{ key: 'plex-400', file: 'IBMPlexSansKR-Regular.ttf', family: 'IBM Plex Sans KR', weight: 400 },
	{ key: 'plex-500', file: 'IBMPlexSansKR-Medium.ttf', family: 'IBM Plex Sans KR', weight: 500 },
	{ key: 'plex-700', file: 'IBMPlexSansKR-Bold.ttf', family: 'IBM Plex Sans KR', weight: 700 },
	{ key: 'pen-400', file: 'NanumPenScript-Regular.ttf', family: 'Nanum Pen Script', weight: 400 },
];

async function collectChars(dir, chars) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (full === path.join(SRC, 'assets')) continue; // 폰트·이미지 바이너리 제외
			await collectChars(full, chars);
		} else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
			for (const ch of await readFile(full, 'utf-8')) chars.add(ch);
		}
	}
}

const chars = new Set(ALWAYS_INCLUDE);
await collectChars(SRC, chars);
for (const ch of ['\n', '\r', '\t']) chars.delete(ch);
const text = [...chars].join('');

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
await mkdir(GENERATED_DIR, { recursive: true });

const manifest = {};
const faces = [];
for (const font of FONTS) {
	const source = await readFile(path.join(SOURCE_DIR, font.file));
	const woff2 = await subsetFont(source, text, { targetFormat: 'woff2' });
	const hash = createHash('sha256').update(woff2).digest('hex').slice(0, 10);
	const name = `${font.key}.${hash}.woff2`;
	await writeFile(path.join(OUT_DIR, name), woff2);
	manifest[font.key] = `/fonts/${name}`;
	faces.push(
		`@font-face {\n\tfont-family: '${font.family}';\n\tfont-style: normal;\n\tfont-weight: ${font.weight};\n\tfont-display: swap;\n\tsrc: url('${manifest[font.key]}') format('woff2');\n}`,
	);
	console.log(`${name}  ${(woff2.length / 1024).toFixed(1)}KB (${font.family} ${font.weight})`);
}

await writeFile(CSS_PATH, `/* build-fonts.mjs가 생성. 직접 수정하지 말 것. */\n${faces.join('\n')}\n`);
await writeFile(path.join(GENERATED_DIR, 'manifest.json'), JSON.stringify(manifest, null, '\t'));
console.log(`glyph source: ${chars.size} chars`);
