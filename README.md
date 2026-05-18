# 고렌트카 홈페이지 실행 프로젝트

이 프로젝트는 다음 기능을 포함합니다.

- 소개 페이지
- 차량 안내 페이지
- 예약 접수 폼
- `POST /api/reservations` 예약 API
- 관리자 로그인 페이지
- 예약 목록 조회 / 상태 변경 / 삭제
- 파일 기반 DB 저장(`data/reservations.json`)

## 1. 설치

터미널에서 프로젝트 폴더로 이동 후 아래 명령어를 실행하세요.

```bash
npm install
```

## 2. 환경변수 설정

`.env.example` 파일을 복사해서 `.env` 파일을 만든 뒤 필요한 값을 수정하세요.

```env
PORT=3000
ADMIN_PASSWORD=1234
SESSION_SECRET=change-this-secret
```

## 3. 실행

```bash
npm start
```

실행 후 아래 주소로 접속합니다.

- 홈페이지: `http://localhost:3000`
- 관리자 페이지: `http://localhost:3000/admin.html`

## 4. 관리자 로그인

기본 비밀번호는 `.env`의 `ADMIN_PASSWORD` 값입니다.
기본 예시는 `1234`입니다.

## 5. 예약 데이터 저장 위치

예약이 접수되면 아래 파일에 저장됩니다.

```txt
data/reservations.json
```

## 6. 다음에 바로 붙일 수 있는 확장 기능

원하면 이어서 아래 기능도 추가할 수 있습니다.

- 예약 확인 문자 발송
- 네이버 지도 / 카카오맵 연결
- 실제 업체 정보 반영
- 차량 이미지 / 요금표 관리자 등록
- 달력형 예약 현황
- Render 배포용 설정
- Supabase / MySQL DB 전환


## 차량 사진

- 경차, 중형 세단, SUV, 승합차 예시 사진이 `public/images` 폴더에 포함되어 있습니다.
- 사진 출처와 라이선스는 `public/images/CREDITS.txt`를 확인하세요.
- 현재 사진은 예시 이미지이므로, 실제 고렌트카 보유 차량 사진으로 교체하면 더 자연스럽습니다.

## 설치 관련 참고

- 다른 환경에서 설치 오류가 날 경우 `node_modules`와 `package-lock.json`을 지운 뒤 다시 `npm install` 하세요.
- 이 배포본에는 `node_modules`가 포함되지 않도록 정리했습니다.
