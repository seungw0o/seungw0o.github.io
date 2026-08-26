# seungw0o.dev — 개인 기술 블로그

Astro 기반 정적 블로그. https://seungw0o.github.io 로 서빙된다.

## 브랜치와 배포

- 브랜치는 **main 하나**만 쓴다. 별도 develop/feature 브랜치 없음.
- **main에 push하면 곧바로 배포된다.** GitHub Actions(`.github/workflows/deploy.yml`)가
  빌드해 GitHub Pages로 올린다. 발행 준비가 안 된 글이 있으면 push하지 말 것.
- 러너는 Node 22를 쓴다(Astro가 >=22.12 요구, Node 20에서 빌드 실패 이력 있음).
  로컬에서도 `~/.nvm/versions/node/v22.12.0` 등 22 이상을 쓴다.
- 패키지 매니저는 pnpm (`packageManager` 필드 고정).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

- **새 글(.mdx)을 추가하면 dev 서버를 재시작해야 한다.** 콘텐츠 컬렉션이 새 파일을
  못 잡고, 폰트 서브셋도 갱신되지 않는다.
- 빌드 검증은 `pnpm build`.

## 글 작성

- 글은 `src/content/blog/*.mdx`. frontmatter는 `title`, `description`,
  `pubDate`('08 21 2026' 형식), 선택적으로 `heroImage`.
- **파일명이 곧 URL이다** (`font.mdx` → `/blog/font/`). 발행 후 파일명을 바꾸면
  공유된 링크가 깨진다. 제목 변경은 안전, 파일명 변경은 금지.
- 글 이미지는 `src/assets/blog/<글이름>/`에 두고 상대 경로로 참조한다.
- 문체 컨벤션: 담백한 경험담 존댓말("~했습니다"), 짧은 문장, 시행착오 서사
  (예상 → 측정/발견 → 반전 → 해결). "~하게 되었습니다" 남용 금지,
  이전 개발자를 깎는 톤 금지, 근거 없는 단정 금지. AI스러운 표현
  (이모지 남발, 과한 정리체, 억지 교훈) 금지.
- 편집기에서 붙여넣을 때 **논브레이킹 스페이스(U+00A0)가 자주 유입**된다.
  발행 전 확인할 것. 일반 공백처럼 보이지만 Edit 도구 매칭과 렌더링을 깨뜨린다.

## 폰트 파이프라인 (빌드 타임 서브셋)

`scripts/build-fonts.mjs`가 `dev`/`build` 앞에 실행되어, `src/` 아래 텍스트 파일의
모든 글자를 수집해 실제 쓰는 글자만 담은 woff2를 생성한다.

- 원본 TTF: `src/assets/fonts/source/` (IBM Plex Sans KR 400/500/700, Nanum Pen
  Script — 모두 OFL, 커밋됨).
- 산출물은 **커밋하지 않는다** (`public/fonts/`, `src/styles/fonts.generated.css`,
  `src/assets/fonts/generated/` 모두 gitignore).
- **함정: 서브셋에 없는 글자는 조용히 시스템 폰트로 폴백된다.** 글에 새 글자를
  쓰고 dev 서버를 재시작하지 않으면 그 글자만 다른 폰트로 보인다. 빌드는 매번
  재생성하므로 배포본은 안전하다.
- 런타임에 생성되는 문자열(예: 날짜의 "년월일")은 소스에 없으므로 스크립트의
  `ALWAYS_INCLUDE`에 등록해야 한다.

## OG 이미지 파이프라인

`src/pages/og/[...route].ts`가 빌드 시 글마다 OG 카드 PNG를 생성한다
(satori + @resvg/resvg-js). 글: `/og/blog/<id>.png`, 공용: `/og/site.png`.

- 디자인은 블로그 테마(모눈종이·잉크·형광펜·빨간펜·손글씨 서명)를 따른다.
  색 값은 `src/styles/global.css`의 토큰(`--paper`, `--ink`, `--highlight`,
  `--accent`)과 일치시킨다.
- **satori 제약**: 자식이 여럿인 요소는 `display: flex` 필수. 다중 background
  미지원(모눈 가로선/세로선을 레이어 두 장으로 겹침). `box-decoration-break`
  미지원 — 형광펜 하이라이트는 어절별 span의 배경으로 이어 그린다.
- 새 글의 OG는 자동 생성된다. 별도 작업 불필요.

## 방문 집계 (GoatCounter)

- `src/consts.ts`의 `GOATCOUNTER_CODE`가 비어 있지 않고 production 빌드일 때만
  스크립트가 들어간다. dev에서는 집계되지 않는다.
- 대시보드: https://seungw0o.goatcounter.com (비공개, 소유자만).
- 본인 방문 제외: 각 브라우저에서 `https://seungw0o.github.io/#toggle-goatcounter`
  한 번 방문.

## 발행 워크플로

1. `src/content/blog/`에 mdx 작성 (dev 서버 재시작 후 확인)
2. `pnpm build`로 검증 (표·이미지 렌더, OG 생성 확인)
3. main에 커밋 — **push 전이라면 발행이 아니다.** push하는 순간 공개된다.
4. 배포 확인: `gh run watch`로 Actions 성공 확인, 라이브 URL 200 확인
5. 링크드인 공유 전 [Post Inspector](https://www.linkedin.com/post-inspector/)로
   OG 캐시를 미리 긁어둔다. 카카오톡 캐시는
   https://developers.kakao.com/tool/debugger/sharing 에서 초기화.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
