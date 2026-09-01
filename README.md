# seungw0o.dev

Astro 기반 개인 기술 블로그. https://seungw0o.github.io

## 스택

- [Astro](https://astro.build) + MDX — 정적 사이트
- GitHub Pages + GitHub Actions — `main`에 push하면 자동 배포
- pnpm, Node 22 이상

## 개발

```sh
pnpm install
pnpm dev        # localhost:4321
pnpm build      # 프로덕션 빌드 (dist/)
```

새 글(`src/content/blog/*.mdx`)을 추가하면 dev 서버를 재시작해야
콘텐츠 컬렉션과 폰트 서브셋이 갱신된다.

## 구조

- `src/content/blog/` — 글(MDX). 파일명이 곧 URL (`font.mdx` → `/blog/font/`)
- `src/assets/blog/<글이름>/` — 글에 쓰는 이미지
- `scripts/build-fonts.mjs` — 빌드 타임 폰트 서브셋. 소스에서 실제 쓰는
  글자만 모아 woff2를 생성한다 (IBM Plex Sans KR, Nanum Pen Script)
- `src/pages/og/[...route].ts` — 글마다 OG 카드 PNG를 빌드 시 생성
  (satori + resvg)

## 라이선스

글과 이미지의 저작권은 작성자에게 있습니다. 코드는 자유롭게 참고하셔도 됩니다.
폰트는 모두 [SIL OFL](https://openfontlicense.org) 라이선스입니다.
