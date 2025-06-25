from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from datetime import datetime
import time
import json
import re
import random

driver = webdriver.Chrome()
questions_list = []

current_datetime = datetime.now().strftime("%y-%m-%d %H:%M")

try:
    driver.get("https://db.chgk.info/random")
    
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'random_question'))
    )
    
    question_blocks = driver.find_elements(By.CLASS_NAME, 'random_question')
    
    for question_block in question_blocks:
        try:
            question_text = question_block.text.split(':', 1)[-1].strip()
            
            image_url = None
            try:
                img = question_block.find_element(By.TAG_NAME, 'img')
                image_url = img.get_attribute('src')
            except:
                pass
            
            toggle = question_block.find_element(By.CLASS_NAME, 'collapsible')
            driver.execute_script("arguments[0].scrollIntoView();", toggle)
            time.sleep(0.5)
            
            if "collapsed" in toggle.get_attribute("class"):
                toggle.click()
                time.sleep(0.5)
            
            WebDriverWait(question_block, 3).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'div-wrapper'))
            )
            
            answer_div = question_block.find_element(By.CLASS_NAME, 'div-wrapper')
            answer_text = answer_div.find_element(By.XPATH, './/p[contains(., "Ответ:")]').text
            answer_text = re.sub(r'^Ответ:\s*', '', answer_text).strip()
            answer_text = re.sub(r'\.$', '', answer_text)  
            
            try:
                comment = answer_div.find_element(By.XPATH, './/p[contains(., "Комментарий:")]').text
                comment = re.sub(r'^Комментарий:\s*', '', comment).strip()
            except:
                comment = ""
            
            question_data = {
                "model": "api.question",
                "fields": {
                    "question_text": question_text,
                    "answer_text": answer_text,
                    "question_note": comment,
                    "difficulty": random.randint(1, 5),
                    "author_q": 1,
                    "image": image_url if image_url else None,
                    "pub_date_q": current_datetime
                }
            }
            questions_list.append(question_data)
            
        except Exception as e:
            print(f"Ошибка при обработке блока вопроса: {e}")
            continue
    
    with open('questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions_list, f, ensure_ascii=False, indent=2)
    print(f"Успешно сохранено {len(questions_list)} вопросов")
    
finally:
    driver.quit()