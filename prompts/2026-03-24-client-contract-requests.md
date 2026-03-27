# 2026-03-24 Client Contract Requests

프론트 구현 요청 기준 요약:

1. API base URL을 게이트웨이 공개 경로 `/api/documents/v1` 기준으로 사용한다.
2. 공통 요청 헤더는 `Authorization`만 사용하고 `X-User-Id`는 직접 보내지 않는다.
3. 응답은 `GlobalResponse<T>` envelope 기준으로 처리한다.
4. editor state는 `type`, `content`, `version`, `marks`를 유지한다.
5. block write 요청에는 항상 서버 DTO 제약을 반영한다.
