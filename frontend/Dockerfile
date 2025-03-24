# Node.js 베이스 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 파일 복사
COPY . .

# 앱 빌드
RUN npm run build

# 컨테이너 시작 시 실행할 명령
CMD ["npm", "start"]