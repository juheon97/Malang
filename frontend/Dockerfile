# ---- Stage 1: Build ----
# Node.js 이미지를 빌더(builder)로 사용
FROM node:18 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치 (캐싱 활용을 위해 먼저 복사)
COPY package.json package-lock.json* ./
RUN npm ci --only=production # 프로덕션 의존성만 설치 (빌드에 devDependencies가 필요하면 --only=production 제거)

# 소스 파일 전체 복사
COPY . .

# 애플리케이션 빌드 (결과물은 보통 /app/dist 디렉토리에 생성됨)
RUN npm run build

# ---- Stage 2: Production ----
# 가벼운 Nginx 이미지 사용
FROM nginx:stable-alpine

# 빌드 단계(builder)에서 생성된 정적 파일들을 Nginx의 기본 웹 루트 디렉토리로 복사
# Vite의 기본 빌드 출력 디렉토리가 'dist'라고 가정합니다. 만약 다르다면 경로를 수정해주세요.
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택사항) Nginx 설정을 커스터마이징할 경우 (예: SPA 라우팅 처리)
# 아래에서 설명할 nginx.conf 파일을 복사합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx는 기본적으로 80 포트를 사용
EXPOSE 80

# Nginx 서버 실행
CMD ["nginx", "-g", "daemon off;"]