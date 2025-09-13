# import os
# import cv2
# import pandas as pd
# import re

# img_folder = './train/images'          
# csv_file = './train/train_data.csv'    
# save_folder = './LabelledImgs'         
# os.makedirs(save_folder, exist_ok=True)


# print("Checking filenames...")
# for fname in os.listdir(img_folder):
#     safe_name = re.sub(r'[^a-zA-Z0-9\.]', '', fname)
#     if fname != safe_name:
#         os.rename(os.path.join(img_folder, fname), os.path.join(img_folder, safe_name))

# df = pd.read_csv(csv_file)

# df['nose print image'] = df['nose print image'].apply(lambda x: re.sub(r'[^a-zA-Z0-9\.]', '', x))
# df.to_csv('./train/train_data_safe.csv', index=False)
# print("CSV filenames updated.")

# def detect_nose_area(img):
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
#     contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#     if contours:
#         nose_contour = max(contours, key=cv2.contourArea)
#         area = cv2.contourArea(nose_contour)
#         x, y, w, h = cv2.boundingRect(nose_contour)
#         return area, w, h
#     return 0, 0, 0

# def classify_nose(area, width, height):
#     if area < 500: 
#         return 'puppy'
#     else:
#         return 'adult'


# print("Processing images...")

# for idx, row in df.iterrows():
#     filename = row['nose print image']
#     img_path = os.path.join(img_folder, filename)
#     img_path = os.path.normpath(img_path)

#     img = cv2.imread(img_path)
#     if img is None:
#         print(f"Could not read image: {img_path}.")
#         continue

#     area, w, h = detect_nose_area(img)
#     label = classify_nose(area, w, h)


#     new_name = f"{label}_{idx}.jpg"
#     cv2.imwrite(os.path.join(save_folder, new_name), img)
#     print(f"{filename} → {label}")

# print("Donee. Labeled images saved in", save_folder)

# import os
# import shutil

# save_folder = './LabelledImgs'
# classes = ['puppy', 'adult']

# for cls in classes:
#     os.makedirs(os.path.join(save_folder, cls), exist_ok=True)

# for fname in os.listdir(save_folder):
#     if fname.startswith('puppy_'):
#         shutil.move(os.path.join(save_folder, fname), os.path.join(save_folder, 'puppy', fname))
#     elif fname.startswith('adult_'):
#         shutil.move(os.path.join(save_folder, fname), os.path.join(save_folder, 'adult', fname))


import os
import pandas as pd

# Paths to folders
adult_folder = './LabelledImgs/adult'
puppy_folder = './LabelledImgs/puppy'

data = []

# Process adult images
for fname in os.listdir(adult_folder):
    if fname.lower().endswith(('.jpg', '.png', '.bmp')):
        data.append({'ImageFile': fname, 'Tag': 'adult'})

# Process puppy images
for fname in os.listdir(puppy_folder):
    if fname.lower().endswith(('.jpg', '.png', '.bmp')):
        data.append({'ImageFile': fname, 'Tag': 'puppy'})

# Create DataFrame
df = pd.DataFrame(data)

# Save CSV in a common folder
csv_path = './LabelledImgs/images_labels.csv'
df.to_csv(csv_path, index=False)

print(f"CSV generated with {len(df)} entries at {csv_path}")
