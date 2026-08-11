# 모바일 청첩장 — 박성민 ♥ 이윤재

2026. 11. 21 (토) 오후 4:50

정적 HTML/CSS/JS 한 페이지. 빌드 도구 없음.

## 실행

```bash
python3 -m http.server 4321
# → http://localhost:4321
```

`file://`로 직접 열면 폰트·복사 기능 일부가 동작하지 않으니 서버로 띄워주세요.

## 구조

```
index.html              전체 마크업 (섹션별 주석 구분)
assets/css/style.css    스타일 — :root에 컬러 토큰
assets/js/config.js     ★ 날짜·예식장·지도키·BGM 설정
assets/js/main.js       캘린더/갤러리/지도/공유 로직
assets/img/cover.jpg    커버 (01번 = 원본 01 KJH_5460.jpg)
assets/img/gallery/     라이트박스용 1600px  (01~19)
assets/img/thumb/       썸네일용 700px       (01~19)
```

사진 번호는 `수정본` 폴더 파일명 순서와 1:1 대응합니다.

## 채워야 할 항목 (초안 placeholder)

| 위치 | 내용 |
|---|---|
| `index.html` 초대말씀 | 혼주(부모님) 성함 |
| `index.html` 초대말씀 | 신랑·신부 연락처 (`tel:`) |
| `index.html` 소개 | 생년월일, 특징 태그 |
| `index.html` 안내사항 | 포토부스·주차 문구 |
| `index.html` 계좌 | 은행명·계좌번호 6건 |

`○○` 로 표시된 곳이 전부 placeholder입니다.

## 선택 설정 (`assets/js/config.js`)

- **지도** — 오시는 길에는 예식장 약도 이미지(`assets/img/location-map.jpg`, 탭하면
  `location-full.jpg` 원본)가 항상 표시됩니다. 여기에 더해 카카오맵을 띄우려면
  `kakaoMapKey`에 [카카오 개발자센터](https://developers.kakao.com) JavaScript 키 입력
  (플랫폼 > Web에 배포 도메인 등록 필요). 비워두면 약도만 표시됩니다.
- **배경음악** — `assets/audio/`에 mp3를 넣고 `bgm: 'assets/audio/bgm.mp3'`.
  비워두면 우측 상단 BGM 버튼이 숨겨집니다.

## 배포

정적 파일이라 GitHub Pages / Vercel / Netlify 중 아무거나 됩니다.

```bash
# GitHub Pages 예시
git add . && git commit -m "feat: 청첩장 초안"
git push
# → Settings > Pages > Source: main / (root)
```

카카오톡 공유 미리보기는 `index.html`의 `og:` 메타태그로 잡히며,
`og:image`는 절대 URL이어야 정상 노출되므로 배포 후 도메인을 포함한 주소로 수정해주세요.
