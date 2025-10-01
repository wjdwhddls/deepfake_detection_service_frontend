# DeepVoice Shield — Landing Page (Full‑stack)

온디바이스 딥보이스 탐지 앱을 소개하는 **반응형 랜딩 페이지(React + Vite)**와
이메일 구독을 저장하는 **백엔드(Express + SQLite)**가 포함되어 있습니다.

## 구성
```
deepvoice-landing/
  frontend/  # React + Vite
  backend/   # Node.js Express + SQLite
```

## 빠른 시작

### 1) 백엔드
```bash
cd backend
npm i
npm run start   # http://localhost:5050
```

### 2) 프론트엔드 (개발 모드)
```bash
cd ../frontend
npm i
# .env 파일에 API 주소를 지정할 수 있습니다. (기본: http://localhost:5050)
# 예) echo "VITE_API_BASE=http://localhost:5050" > .env
npm run dev     # http://localhost:5173
```

프론트엔드에서 이메일을 등록하면 백엔드의 `backend/data.db`에 저장됩니다.

### 3) 프로덕션으로 함께 서빙(선택)
```bash
# 프론트 빌드
cd frontend
npm run build    # dist/ 생성
# dist/ 폴더가 backend에서 정적 서빙됩니다.
cd ../backend
npm run start    # http://localhost:5050 에서 SPA와 API 동시 제공
```

## 자주 바꿀 곳
- `frontend/src/App.jsx` 상단의 `PLAYSTORE_URL`, `GITHUB_RELEASE_URL`를 실제 링크로 교체
- `/frontend/public/mockup.png`을 앱 스크린샷으로 교체 (파일명 동일 유지 권장)

## 배포 팁
- **Vercel(프론트)** + **Render / Railway(백엔드)** 조합으로 쉽게 배포할 수 있습니다.
- SQLite를 계속 쓰려면 백엔드의 영구 스토리지 옵션을 활성화하세요. (또는 Supabase/Postgres로 교체)

## 라이선스
MIT (사실상 템플릿 수준)
