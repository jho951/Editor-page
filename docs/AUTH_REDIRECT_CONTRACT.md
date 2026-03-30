# Auth Redirect Contract (Explainpage Next.js <-> Editor React)

이 문서는 `explainpage`(Next.js)와 `editor-page`(React) 간 로그인 리다이렉트 계약을 고정합니다.

## 목적

- 로그인 전 사용자가 보던 에디터 경로로 정확히 복귀
- 프레임워크 차이(Next.js / React Router)로 인한 파라미터 불일치 제거
- 오픈 리다이렉트 방지

## 파라미터 규약

editor-page는 아래 쿼리 키를 순서대로 읽습니다.

1. `next`
2. `callbackUrl`
3. `returnUrl`
4. `redirect`
5. `redirectUrl`

값은 다음을 허용합니다.

- 상대 경로: `/doc/123?mode=edit#block-5`
- URL 인코딩된 경로: `%2Fdoc%2F123%3Fmode%3Dedit`
- editor 도메인의 절대 URL: `https://editor.example.com/doc/123`
- 중첩된 URL의 내부 next/callbackUrl (최대 3단계)

허용되지 않는 외부 도메인 URL은 `/`로 강등됩니다.

## 권장 플로우

1. explainpage가 로그인 시작 시 editor 목적지를 `callbackUrl` 또는 `next`로 전달
2. editor-page가 인증 시작 시 동일 목적지를 세션에 저장
3. 백엔드 콜백에서 세션 쿠키를 설정한 뒤 `/auth/callback`으로 이동
4. editor-page는 `/auth/callback` 진입 시 `GET /auth/me`로 로그인 상태를 확인하고 목적지로 이동

## Next.js 예시 (explainpage)

```ts
// app/lib/authRedirect.ts
export function buildEditorSignInUrl(editorBaseUrl: string, nextPath: string) {
  const safeNext = nextPath.startsWith("/") ? nextPath : "/";
  const url = new URL("/signin", editorBaseUrl);
  // editor는 next/callbackUrl 둘 다 이해하므로 하나만 써도 됩니다.
  url.searchParams.set("callbackUrl", safeNext);
  return url.toString();
}
```

```ts
// 사용 예: /doc/abc 편집 중 로그인 필요 시
const signInUrl = buildEditorSignInUrl(process.env.NEXT_PUBLIC_EDITOR_URL!, "/doc/abc");
redirect(signInUrl);
```

## editor-page 구현 포인트

- 파라미터 파싱/정규화: `src/features/auth/api/auth.ts`
- 콜백 복귀 처리: `src/features/auth/ui/AuthCallbackView.tsx`
- `/signin` 진입 처리: `src/features/auth/ui/SignInRedirectView.tsx`

## 운영 체크리스트

- `VITE_SITE_URL`: editor의 공개 URL과 일치해야 함
- `VITE_START_FRONTEND_URL`: explainpage의 공개 URL과 일치해야 함
- 백엔드 OAuth callback 등록 URL에 editor의 `/auth/callback` 포함
- `/auth/callback` 응답에서 세션 쿠키가 `HttpOnly` 및 `SameSite` 정책에 맞게 내려와야 함
