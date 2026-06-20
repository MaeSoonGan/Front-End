# 🤝MaeSoonGan Front-End

## ✍️프로젝트 한 줄 소개

- 사용자와 관리자가 증권 투자 대회 서비스를 이용할 수 있도록 React 기반 화면, API 연동, PWA, 배포 설정을 구현한 프론트엔드 애플리케이션입니다.

<br />

## 🛫레포지토리 개요

- 이 레포지토리는 MaeSoonGan 서비스의 사용자 화면과 관리자 화면을 담당합니다.

- 사용자 화면에서는 회원가입, 로그인, 종목 조회, 매수·매도 주문, 잔고 조회, 대회 참가, 랭킹 조회, 알림 설정 기능을 제공합니다. 관리자 화면에서는 회원 관리, 계정 정지, 시드머니 지급, 대회 관리, 랭킹 관리, 공지 관리, 감사 로그, 점검 모드 기능을 제공합니다.

- Front-End는 AWS EKS 환경에 배포된 Back-End API와 통신하며, 사용자의 요청을 백엔드 서비스로 전달하는 진입점 역할을 합니다. 또한 PWA 설정을 통해 웹 애플리케이션이 모바일 환경에서도 앱처럼 접근될 수 있도록 구성했습니다.

<br />

## 🛠️주요 기능

### 사용자 기능

* 회원가입
* 로그인
* ID/PW 찾기
* 종목 검색
* 종목 상세 조회
* 매수·매도 주문
* 보유 자산 및 잔고 조회
* 관심종목 관리
* 대회 목록 조회
* 대회 참가
* 대회 랭킹 조회
* 알림 설정
* 공지사항 조회
* 회원 정보 수정

### 관리자 기능

* 관리자 로그인
* 대시보드 조회
* 회원 목록 조회
* 회원 계정 정지 및 해제
* 시드머니 지급
* 대회 생성 및 관리
* 대회 상세 조회
* 랭킹 관리
* 공지사항 등록 및 관리
* 점검 모드 제어
* 감사 로그 조회
* 운영 모니터링 화면 조회

<br />

## 📚기술 스택

| 구분              | 기술                                           |
| ----------------- | ---------------------------------------------- |
| Language          | TypeScript                                     |
| Framework         | React                                          |
| Styling           | Tailwind CSS, CSS                              |
| Routing           | React Router DOM                               |
| State Management  | React Context, Web Storage                     |
| API Client        | Axios                                          |
| Chart             | Recharts                                       |
| Icons             | lucide-react                                   |
| Build Tool        | Vite                                           |
| Test              | Vitest, jsdom                                  |
| PWA               | vite-plugin-pwa, Workbox, Web App Manifest    |
| Deploy            | Docker, Nginx, Kubernetes, AWS EKS, Amazon ECR |
| CI/CD             | GitHub Actions                                 |
| Version Control   | GitHub                                         |

<br />

## 📋디렉터리 구조

| 경로               | 설명                         |
| ------------------ | ---------------------------- |
| `src`              | 프론트엔드 애플리케이션 소스 코드 |
| `src/app`          | 라우터 설정                  |
| `src/api`          | Axios 기반 API 요청 모듈     |
| `src/pages`        | 사용자, 관리자, 인증, 인프라 페이지 |
| `src/components`   | 공통 및 도메인별 UI 컴포넌트 |
| `src/layouts`      | 사용자, 관리자, 인증, 인프라 레이아웃 |
| `src/contexts`     | React Context 기반 전역 상태 |
| `src/hooks`        | 커스텀 훅                    |
| `src/types`        | TypeScript 타입 정의         |
| `src/utils`        | 공통 유틸리티                |
| `src/mocks`        | 화면 개발 및 테스트용 mock 데이터 |
| `src/__tests__`    | Vitest 테스트 코드           |
| `src/assets`       | 애플리케이션 내부 이미지     |
| `public`           | PWA 아이콘 등 정적 파일      |
| `docs`             | EKS 배포 문서                |
| `k8s`              | Kubernetes Deployment/Service 매니페스트 |
| `.github`          | GitHub Actions 워크플로우 및 이슈/PR 템플릿 |


## 📽️시연 영상
- [사용자 화면] (https://youtube.com/shorts/nTnPbLUmcGk?feature=share)
- [관리자 화면] (https://youtu.be/YPN9fH-kVCA)

## 🔧트러블슈팅

