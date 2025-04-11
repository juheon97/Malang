pipeline {
    agent any

    environment {
        SSH_KEY = credentials('SSH_KEY')
        EC2_USER = credentials('EC2_USER')
        EC2_IP = credentials('EC2_IP')

        JAVA_HOME = '/opt/java/openjdk'
        GRADLE_HOME = '/opt/gradle-8.13'

        // Docker 이미지 관련 환경 변수
        DOCKER_HUB = credentials('dockerhub-credentials')
        DOCKER_IMAGE_NAME = "${DOCKER_HUB_USR}/d110_jenkins_image_build"
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}" // Jenkins 빌드 번호를 태그로 사용

        REDIS_PWD = credentials('REDIS_PWD')
    }

    tools {
        jdk 'JDK17'
        gradle 'Gradle 8.13'
    }

    stages {
        stage('Clone Repository') {

            steps {
            echo 'Cloning the repository...'
            git branch: 'backend',
                url: 'https://lab.ssafy.com/s12-ai-speech-sub1/S12P21D110.git',
                credentialsId: 'JENKINS_PAT'
                }
        }

        stage('secret download'){
            steps{
                withCredentials([
                    file(credentialsId: 'application-yaml', variable: 'propConfig')
                ]){
                    script{
                        sh '''
                            mkdir -p $WORKSPACE/backend/src/main/resources/

                            # 기존 application으로 시작하는 파일 모두 삭제
                            rm -f $WORKSPACE/backend/src/main/resources/application*

                            # 개발 환경 설정 파일 복사
                            cp $propConfig $WORKSPACE/backend/src/main/resources/application.yaml

                            echo "Copy successful!"
                            ls -l $WORKSPACE/backend/src/main/resources/application*
                        '''
                    }
                }
            }
        }

        stage('Build Spring Boot App') {
            steps {
                echo 'Building the Spring Boot application...'
                dir('backend') { // 백엔드 코드가 있는 디렉토리로 변경
                    sh """
                	chmod +x gradlew
                	./gradlew clean build -x test
            		"""
                }
            }
        }

	stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-token') {
                    sh """
                        cd backend/  # Gradle 프로젝트 폴더로 이동
                        ./gradlew sonar
                    """
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                dir('backend') { // Dockerfile이 있는 디렉토리로 변경
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_NAME}:latest"
                }
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo ${DOCKER_HUB_PSW} | docker login -u ${DOCKER_HUB_USR} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    sh "docker push ${DOCKER_IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2...'

                // docker-compose.yml 파일을 EC2로 전송
                sshagent(['SSH_KEY']) {
                    sh "scp -o StrictHostKeyChecking=no $WORKSPACE/backend/docker-compose.yml ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/"

                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} '
                            # Redis 배포
                            cd /home/${EC2_USER}
                            REDIS_PASSWORD=${REDIS_PWD} docker compose down redis || true
                            REDIS_PASSWORD=${REDIS_PWD} docker compose up -d redis

                            # Redis가 완전히 시작될 때까지 잠시 대기
                            sleep 5

                            # Redis 상태 확인
                            docker exec malang_redis redis-cli -a ${REDIS_PWD} ping || echo "Redis not responding"

                            # Docker 이미지 풀
                            docker pull ${DOCKER_IMAGE_NAME}:latest

                            # 기존 컨테이너 중지 및 제거
                            docker stop backend-app1 || true
                            docker rm backend-app1 || true

                            # 새 컨테이너 실행 (Redis 비밀번호 환경 변수 전달)
                            docker run -d -p 8080:8080 --name backend-app1 --network app-network -e REDIS_PASSWORD=${REDIS_PWD} ${DOCKER_IMAGE_NAME}:latest

                            # 백엔드 컨테이너가 완전히 시작될 때까지 대기
                            sleep 5
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker rmi $(docker images -q -f dangling=true) || true'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }

}
