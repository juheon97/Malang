# from operator import index
import os
import cv2
import mediapipe as mp
import numpy as np
from PIL import ImageFont, ImageDraw, Image  # 한글 출력open
import time

from jamo import h2j, j2hcj
# from unicode import join_jamos
from hangul_utils import join_jamos

gesture = {
    0: 'ga', 1: 'na', 2: 'da', 3: 'ra', 4: 'ma', 5: 'ba', 6: 'sa', 7: 'a', 8: 'ja', 9: 'ha',
    10: 'aa', 11: 'ou', 12: 'yoe', 13: 'o', 14: 'u', 15: 'eu', 16: 'lee', 17: 'ae', 18: 'e', 19: 'space', 20: 'clear',
    21: 'next'
}

hangeul_gesture = {
    0: 'ㄱ', 1: 'ㄴ', 2: 'ㄷ', 3: 'ㄹ', 4: 'ㅁ', 5: 'ㅂ', 6: 'ㅅ', 7: 'ㅇ', 8: 'ㅈ', 9: 'ㅎ',
    10: 'ㅏ', 11: 'ㅓ', 12: 'ㅕ', 13: 'ㅗ', 14: 'ㅜ', 15: 'ㅡ', 16: 'ㅣ', 17: 'ㅐ', 18: 'ㅔ', 19: ' ', 20: '', 21: 'next'
}
hangeul_gesture2 = {
    0: 'ㄱ', 1: 'ㄴ', 2: 'ㄷ', 3: 'ㄹ', 4: 'ㅁ', 5: 'ㅂ', 6: 'ㅅ', 7: 'ㅇ', 8: 'ㅈ', 9: 'ㅎ',
    10: 'ㅏ', 11: 'ㅓ', 12: 'ㅕ', 13: 'ㅗ', 14: 'ㅜ', 15: 'ㅡ', 16: 'ㅣ', 17: 'ㅐ', 18: 'ㅔ', 19: 'space', 20: 'clear',
    21: 'next'
}

# MediaPipe hands model
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.5
)

# Gesture recognition data
script_dir = os.path.dirname(os.path.abspath(__file__))
file = np.genfromtxt(os.path.join(script_dir, "data/gesture_train.csv"), encoding='UTF-8', delimiter=',')
anglefile = file[:, :-1]
labelfile = file[:, -1]
angle = anglefile.astype(np.float32)
label = labelfile.astype(np.float32)
knn = cv2.ml.KNearest_create()
knn.train(angle, cv2.ml.ROW_SAMPLE, label)

cap = cv2.VideoCapture(0)

start_t = time.time()
sentence = ''
merge_jamo = ''
hold = 2.0  # 2초에서 1초로 변경하여 반응성 향상

# 된소리 처리를 위한 변수
last_consonant = None
last_consonant_time = time.time()
double_consonant_threshold = 1.5  # 1.5초 이내에 같은 자음이 두 번 인식되면 된소리로 처리

while cap.isOpened():
    success, img = cap.read()
    if not success:
        continue

    img = cv2.flip(img, 1)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    result = hands.process(img)

    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    if result.multi_hand_landmarks is not None:
        for res in result.multi_hand_landmarks:
            joint = np.zeros((21, 3))
            for j, lm in enumerate(res.landmark):
                joint[j] = [lm.x, lm.y, lm.z]

            # 관절 사이 벡터 계산
            v1 = joint[[0, 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 0, 17, 18, 19], :]
            v2 = joint[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], :]
            v = v2 - v1  # [20,3]
            # 정규화
            v = v / np.linalg.norm(v, axis=1)[:, np.newaxis]

            # 각도 계산
            angle = np.arccos(np.einsum('nt,nt->n',
                                        v[[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18], :],
                                        v[[1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19], :]))  # [15,]

            angle = np.degrees(angle)  # Convert radian to degree

            # Inference gesture
            data = np.array([angle], dtype=np.float32)
            ret, results, neighbours, dist = knn.findNearest(data, 3)
            idx = int(results[0][0])

            if idx in gesture.keys():
                current_time = time.time()

                # 일반 인식 처리
                if current_time - start_t > hold:
                    # 된소리 처리 로직
                    if idx in [0, 2, 5, 6, 8]:  # ㄱ, ㄷ, ㅂ, ㅅ, ㅈ
                        if last_consonant == idx and (current_time - last_consonant_time) < double_consonant_threshold:
                            # 같은 자음이 짧은 시간 내에 두 번 인식되면 된소리로 처리
                            if idx == 0:
                                merge_jamo = merge_jamo[:-1] + 'ㄲ'  # 마지막 ㄱ을 ㄲ으로 교체
                                print("된소리 변환: ㄲ")
                            elif idx == 2:
                                merge_jamo = merge_jamo[:-1] + 'ㄸ'
                                print("된소리 변환: ㄸ")
                            elif idx == 5:
                                merge_jamo = merge_jamo[:-1] + 'ㅃ'
                                print("된소리 변환: ㅃ")
                            elif idx == 6:
                                merge_jamo = merge_jamo[:-1] + 'ㅆ'
                                print("된소리 변환: ㅆ")
                            elif idx == 8:
                                merge_jamo = merge_jamo[:-1] + 'ㅉ'
                                print("된소리 변환: ㅉ")

                            # 상태 초기화
                            last_consonant = None
                            last_consonant_time = 0
                        else:
                            # 일반 자음으로 처리
                            merge_jamo += hangeul_gesture[idx]

                            # 상태 업데이트
                            last_consonant = idx
                            last_consonant_time = current_time
                            print(f"자음 인식: {hangeul_gesture[idx]}, 시간: {current_time}")
                    else:
                        # 모음이나 다른 제스처 처리
                        if idx == 19:  # space
                            sentence += ' '
                        elif idx == 20:  # clear
                            sentence = ''
                            merge_jamo = ''
                        elif idx == 21:  # next
                            sentence += join_jamos(merge_jamo)
                            merge_jamo = ''
                        else:
                            merge_jamo += hangeul_gesture[idx]

                        # 상태 초기화 (자음이 아니므로)
                        last_consonant = None
                        last_consonant_time = 0

                    start_t = time.time()
                    print(f"인식된 제스처: {hangeul_gesture2[idx]} ({idx})")

                # 한글 출력하기 위해서 PIL 라이브러리 사용
                font = ImageFont.truetype("fonts/gulim.ttc", 35)
                small_font = ImageFont.truetype("fonts/gulim.ttc", 20)
                # cv2 -> PIL로 이미지 형태 변경
                img_pil = Image.fromarray(img)
                # 이미지에 한글 입력
                draw = ImageDraw.Draw(img_pil)
                draw.text((60, 70), sentence, font=font, fill=(0, 255, 0))
                # 현재 입력 중인 자모 표시
                draw.text((60, 120), merge_jamo, font=font, fill=(255, 0, 0))

                # 디버깅 정보 표시
                debug_info = f"Last: {hangeul_gesture[last_consonant] if last_consonant is not None else 'None'}, Time diff: {current_time - last_consonant_time:.1f}s"
                draw.text((60, 170), debug_info, font=small_font, fill=(255, 255, 0))

                # 이미지 좌표 설정, 출력값, 폰트 설정, 글자색
                img = np.array(img_pil)  # 다시 사용하도록 numpy로 변경

            mp_drawing.draw_landmarks(img, res, mp_hands.HAND_CONNECTIONS)

    cv2.imshow('Translator', img)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
