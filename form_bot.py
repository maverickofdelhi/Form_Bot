import time
import random
import requests
import concurrent.futures
from faker import Faker
from human_engine import HumanEngine

# Global engine instance (optional, can be passed around)
_human_engine = None

def get_human_engine(use_ai=False):
    """Returns a new HumanEngine instance for isolation."""
    if use_ai:
        return HumanEngine()
    return None

def human_typing(element, text):
    """Simulates human typing with random delays."""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.05, 0.2))  # Typing speed variation

def human_delay(min_seconds=1, max_seconds=3):
    """Adds a random delay to simulate human thinking/reaction time."""
    time.sleep(random.uniform(min_seconds, max_seconds))

def fill_form_dynamically(driver, url, use_ai=False, engine=None):
    """
    Attempts to fill a Microsoft Form dynamically by identifying input fields.
    """
    if use_ai and not engine:
        engine = get_human_engine(use_ai)
    driver.get(url)
    human_delay(5, 8)  # Wait longer for page load
    
    # DEBUG: Save page source
    with open("page_source.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    print("Saved page_source.html")

    fake = Faker()

    try:
        # Find all question items
        question_items = driver.find_elements(By.CSS_SELECTOR, "div[data-automation-id='questionItem']")
        print(f"Found {len(question_items)} questions.")

        for i, question in enumerate(question_items):
            try:
                # scroll into view
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", question)
                human_delay(0.5, 1)

                # Try to identify type
                
                # 1. Likert Scale (Grid)
                tables = question.find_elements(By.TAG_NAME, "table")
                if tables:
                    print(f"Question {i+1}: Detected Likert Scale.")
                    rows = question.find_elements(By.CSS_SELECTOR, "tr[data-automation-id='likerTableTr']")
                    for row in rows:
                        radios = row.find_elements(By.CSS_SELECTOR, "input[role='radio']")
                        if radios:
                            # Select a random option in the row
                            choice = random.choice(radios)
                            # Click the parent label or the input itself using JS to avoid interception
                            driver.execute_script("arguments[0].click();", choice)
                            human_delay(0.5, 1)
                    continue

                # 2. Radio Group (Single Choice)
                radios = question.find_elements(By.CSS_SELECTOR, "input[role='radio']")
                if radios:
                    print(f"Question {i+1}: Detected Radio Group.")
                    # Check if any is already selected
                    selected = False
                    for r in radios:
                        if r.get_attribute("aria-checked") == "true":
                            selected = True
                            break
                    
                    if not selected:
                         if engine:
                             try:
                                 label = question.find_element(By.CSS_SELECTOR, ".office-form-question-title, span[data-automation-id='questionTitle']").text
                             except:
                                 label = "Question"
                             
                             option_texts = []
                             for r in radios:
                                 # Try to find parent label or following span
                                 try:
                                     opt_label = r.find_element(By.XPATH, "./ancestor::label//span").text
                                     option_texts.append(opt_label)
                                 except:
                                     option_texts.append("Option")
                             
                             choice_text = engine.generate_response(label, options=option_texts)
                             # Find the radio with this text
                             for r, txt in zip(radios, option_texts):
                                 if txt == choice_text:
                                      driver.execute_script("arguments[0].click();", r)
                                      break
                         else:
                             choice = random.choice(radios)
                             driver.execute_script("arguments[0].click();", choice)
                         human_delay(0.5, 1)
                    continue

                # 3. Checkboxes (Multiple Choice)
                checkboxes = question.find_elements(By.CSS_SELECTOR, "input[role='checkbox']")
                if checkboxes:
                    print(f"Question {i+1}: Detected Checkboxes.")
                    # Select 1 or 2 random options
                    num_to_select = random.randint(1, min(len(checkboxes), 2))
                    choices = random.sample(checkboxes, num_to_select)
                    for choice in choices:
                        if choice.get_attribute("aria-checked") != "true":
                             driver.execute_script("arguments[0].click();", choice)
                             human_delay(0.5, 1)
                    continue

                # 4. Text Input
                text_inputs = question.find_elements(By.CSS_SELECTOR, "input[type='text'], textarea")
                if text_inputs:
                    print(f"Question {i+1}: Detected Text Input.")
                    for input_field in text_inputs:
                         # Get question text for context
                         try:
                             label = question.find_element(By.CSS_SELECTOR, ".office-form-question-title, span[data-automation-id='questionTitle']").text
                         except:
                             label = "Question"
                         
                         response_text = engine.generate_response(label) if engine else fake.sentence()
                         input_field.click()
                         input_field.clear()
                         human_typing(input_field, response_text)
                         human_delay(0.5, 1)
                    continue

            except Exception as q_e:
                print(f"Error handling question {i+1}: {q_e}")

        # Submit Button
        submit_btn = None
        try:
             # Look for button with specific classes or text
             buttons = driver.find_elements(By.CSS_SELECTOR, "button[data-automation-id='submitButton']")
             if buttons:
                 submit_btn = buttons[0]
             else:
                 # Fallback
                 all_buttons = driver.find_elements(By.TAG_NAME, "button")
                 for btn in all_buttons:
                     if "submit" in btn.text.lower():
                         submit_btn = btn
                         break
        except:
            pass
            
        if submit_btn:
            print("Found submit button. Clicking...")
            human_delay(2)
            submit_btn.click()
            human_delay(5) # Wait for submission
        else:
            print("Could not find submit button.")

    except Exception as e:
        print(f"Error during form filling: {e}")
        
    finally:
        print("Closing in 5 seconds...")
        time.sleep(5)
        driver.quit()

def fill_google_form(driver, url, use_ai=False, engine=None):
    """
    Attempts to fill a Google Form, handling multiple pages.
    """
    if use_ai and not engine:
        engine = get_human_engine(use_ai)
    driver.get(url)
    human_delay(3, 5)
    fake = Faker()

    max_pages = 10
    for page_num in range(max_pages):
        print(f"Processing page {page_num + 1}...")
        
        try:
            # Google Forms usually wrap questions in div[role='listitem']
            questions = driver.find_elements(By.CSS_SELECTOR, "div[role='listitem']")
            print(f"Found {len(questions)} questions on this page.")
    
            for i, question in enumerate(questions):
                # Skip if already filled/hidden (simplistic check)
                if not question.is_displayed():
                    continue

                try:
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", question)
                    human_delay(0.5, 1)
    
                    # 1. Radio Buttons
                    radios = question.find_elements(By.CSS_SELECTOR, "div[role='radio']")
                    if radios:
                        # Check selection
                        selected = False
                        for r in radios:
                            if r.get_attribute("aria-checked") == "true":
                                selected = True
                                break
                        if not selected:
                            if engine:
                                # Get label from heading
                                try:
                                    label = question.find_element(By.CSS_SELECTOR, "div[role='heading']").text
                                except:
                                    label = "Question"
                                
                                option_texts = [get_option_label(r) for r in radios]
                                choice_text = engine.generate_response(label, options=option_texts)
                                
                                for r, txt in zip(radios, option_texts):
                                    if txt == choice_text:
                                        driver.execute_script("arguments[0].click();", r)
                                        break
                            else:
                                choice = random.choice(radios)
                                driver.execute_script("arguments[0].click();", choice)
                            human_delay(0.5, 1)
                        continue
    
                    # 2. Checkboxes
                    checkboxes = question.find_elements(By.CSS_SELECTOR, "div[role='checkbox']")
                    if checkboxes:
                        num_to_select = random.randint(1, min(len(checkboxes), 2))
                        choices = random.sample(checkboxes, num_to_select)
                        for choice in choices:
                            if choice.get_attribute("aria-checked") != "true":
                                driver.execute_script("arguments[0].click();", choice)
                                human_delay(0.5, 1)
                        continue
    
                    # 3. Text Inputs
                    text_inputs = question.find_elements(By.CSS_SELECTOR, "input[type='text'], textarea")
                    if text_inputs:
                        for input_field in text_inputs:
                            if input_field.is_displayed() and input_field.is_enabled():
                                # Check if empty
                                curr_val = input_field.get_attribute("value")
                                if not curr_val:
                                    input_field.click()
                                    input_field.clear()
                                    
                                    # Get question text for context
                                    try:
                                        label = question.find_element(By.CSS_SELECTOR, "div[role='heading']").text
                                    except:
                                        label = "Question"

                                    if engine:
                                        response_text = engine.generate_response(label)
                                    else:
                                        response_text = fake.sentence()
                                        if "email" in (input_field.get_attribute("name") or "").lower():
                                            response_text = fake.email()
                                    
                                    human_typing(input_field, response_text)
                                    human_delay(0.5, 1)
                        continue
    
                except Exception as q_e:
                    print(f"Error handling question {i+1}: {q_e}")

            # Navigation / Subsmission
            submit_btn = None
            next_btn = None
            
            # Re-find buttons to ensure stale elements aren't used
            buttons = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
            target_submit_texts = ["submit", "envoyer", "senden", "enviar"]
            target_next_texts = ["next", "suivant", "weiter", "siguiente"]

            for btn in buttons:
                txt = (btn.text or "").lower()
                # print(f"Button found: {txt}")
                if any(t in txt for t in target_submit_texts):
                    submit_btn = btn
                    break
                elif any(t in txt for t in target_next_texts):
                    next_btn = btn

            # Strategy 2: Class based fallbacks
            if not submit_btn and not next_btn:
                 # Submit/Next often share this class
                 potential_action = driver.find_elements(By.CSS_SELECTOR, ".uArJ5e.UQuaGc.Y5sE8d")
                 for p in potential_action:
                     if p.is_displayed():
                         # If we can't distinguish, assume it's next if we are early, or submit?
                         # Usually text is present. If no text, might be an icon?
                         pass 
            
            if submit_btn:
                print("Found Submit button. Clicking...")
                human_delay(1)
                submit_btn.click()
                human_delay(5)
                print("Submitted.")
                return # Done
            
            elif next_btn:
                print("Found Next button. Moving to next page...")
                human_delay(1)
                next_btn.click()
                human_delay(3) # Wait for page transition
                continue 
            
            else:
                print("No Submit or Next button found. Ending loop.")
                break

        except Exception as e:
            print(f"Error in page loop: {e}")
            break

def get_option_label(option_element):
    """Helper to extract label text from a Google/MS form option."""
    try:
        return option_element.get_attribute("data-value") or option_element.text
    except:
        return "Option"

def fill_github_form(driver, url, use_ai=False, engine=None):
    """
    Attempts to fill the specific GitHub Questionnaire (MRAQuestionnaire).
    """
    if use_ai and not engine:
        engine = get_human_engine(use_ai)
    driver.get(url)
    human_delay(3, 5)
    
    try:
        # The form uses radio buttons with names like q1, q2, etc.
        # We find all unique names for radio groups
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        question_names = sorted(list(set([inp.get_attribute("name") for inp in inputs if inp.get_attribute("name")])))
        
        print(f"Found {len(question_names)} questions (radio groups).")

        for name in question_names:
            try:
                # Find all options for this question
                radios = driver.find_elements(By.NAME, name)
                if radios:
                    # Filter for visible ones just in case
                    visible_radios = [r for r in radios if r.is_displayed()]
                    if visible_radios:
                        if engine:
                            # Try to find question text
                            try:
                                # Usually the question text is in a label or p before the radio group
                                q_text = driver.execute_script("""
                                    var radio = arguments[0];
                                    var container = radio.closest('.question-container') || radio.parentElement.parentElement;
                                    return container.innerText.split('\\n')[0];
                                """, visible_radios[0])
                            except:
                                q_text = f"Question {name}"
                            
                            option_texts = [r.get_attribute("value") or r.find_element(By.XPATH, "following-sibling::node()[1]").text for r in visible_radios]
                            choice_text = engine.generate_response(q_text, options=option_texts)
                            
                            for r, txt in zip(visible_radios, option_texts):
                                if txt == choice_text:
                                     driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", r)
                                     driver.execute_script("arguments[0].click();", r)
                                     break
                        else:
                            choice = random.choice(visible_radios)
                            # Scroll to it
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", choice)
                            human_delay(0.2, 0.5)
                            # Click using JS for reliability
                            driver.execute_script("arguments[0].click();", choice)
                        human_delay(0.3, 0.7)
            except Exception as q_e:
                print(f"Error handling question {name}: {q_e}")

        # Submit Button
        submit_btn = None
        try:
            submit_btn = driver.find_element(By.CLASS_NAME, "btn-submit")
        except NoSuchElementException:
            # Fallback
            buttons = driver.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                if "submit" in btn.text.lower():
                    submit_btn = btn
                    break
        
        if submit_btn:
            print("Found Submit button. Clicking...")
            human_delay(1)
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
            submit_btn.click()
            human_delay(5)
            print("Submitted.")
        else:
            print("Could not find submit button.")

    except Exception as e:
        print(f"Error filling GitHub form: {e}")

def run_bot(url, num_responses, use_ai=False, log_callback=print, progress_callback=None, persona_callback=None):
    """
    Runs the bot for a specific number of responses.
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.common.by import By

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Detect Form Type
    is_google = "docs.google.com" in url or "forms.gle" in url
    is_github = "github.io" in url
    
    form_type = "Microsoft Forms"
    if is_google:
        form_type = "Google Forms"
    elif is_github:
        form_type = "GitHub Form"
        
    log_callback(f"Detected form type: {form_type}")

    for i in range(num_responses):
        log_callback(f"Starting response {i+1}/{num_responses}...")
        driver = None
        engine = get_human_engine(use_ai)
        
        if engine and persona_callback:
            p = engine.current_persona
            persona_callback(f"Persona: {p.name} | {p.type} | Age: {p.age} | {p.gender}")

        try:
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
            
            if is_google:
                fill_google_form(driver, url, use_ai=use_ai, engine=engine)
            elif is_github:
                fill_github_form(driver, url, use_ai=use_ai, engine=engine)
            else:
                fill_form_dynamically(driver, url, use_ai=use_ai, engine=engine)
                
            log_callback(f"Response {i+1} submitted successfully.")
        except Exception as e:
            log_callback(f"Error in response {i+1}: {e}")
        finally:
            if driver:
                try: driver.quit()
                except: pass
            
            if progress_callback:
                progress_callback(i + 1, num_responses)
            
            human_delay(2, 4)

def run_speed_bot(url, num_responses, use_ai=False, log_callback=print, progress_callback=None, persona_callback=None):
    """
    Submits responses using high-speed multi-threaded POST requests with retries.
    """
    if "divyansh1920.github.io/MRA" not in url:
        log_callback("Error: Speed Mode currently only supports the GitHub MRA form.")
        return

    endpoint = "https://script.google.com/macros/s/AKfycbxi5Jwzl8qKP6bIFq2FFvturXR1_PWw-pNej1o1iCE25nq_gIt5JCEijVDxoVbRjoI7rA/exec"
    
    options_map = {
        "q1": ["18–24 years", "25–34 years", "35–44 years", "45–54 years", "55 years and above"],
        "q2": ["Male", "Female", "Prefer not to say"],
        "q3": ["High school or less", "Bachelor's degree", "Master's degree", "Doctoral degree"],
        "q4": ["Government Service", "Private Service", "Home Maker", "Student", "Entrepreneur"],
        "q5": ["Below ₹3 Lakh", "₹3,00,001 – 6 Lakh", "₹6,00,001 – 10 Lakh", "₹10,00,001 – 15 Lakh", "₹15,00,001 – 25 Lakh", "Above ₹25,00,001", "Prefer not to say"],
        "q6": ["Could not afford full payment", "Easy and quick approval", "No interest offer", "Recommended by others", "Other"],
        "q7": ["1", "2", "3", "4", "5"],
        "q8": ["1", "2", "3", "4", "5"],
        "q9": ["Less than 5%", "5.01% – 10%", "10.01% – 20%", "20.01% – 30%", "More than 30%", "I don't know"],
        "q10": ["1", "2", "3", "4", "5"],
        "q11": ["1", "2", "3", "4", "5"],
        "q12": ["1", "2", "3", "4", "5"],
        "q13": ["1", "2", "3", "4", "5"],
        "q14": ["1", "2", "3", "4", "5"],
        "q15": ["1", "2", "3", "4", "5"],
        "q16": ["1", "2", "3", "4", "5"],
        "q17": ["1", "2", "3", "4", "5"],
        "q18": ["1", "2", "3", "4", "5"],
        "q19": ["1", "2", "3", "4", "5"],
        "q20": ["1", "2", "3", "4", "5"],
        "q21": ["1", "2", "3", "4", "5"]
    }

    submitted_count = [0] # List for mutability in closure

    def submit_one(index):
        engine = get_human_engine(use_ai)
        if engine and persona_callback:
            p = engine.current_persona
            persona_callback(f"Persona: {p.name} | {p.type} | Age: {p.age}")

        payload = {}
        for name, vals in options_map.items():
            if engine:
                payload[name] = engine.generate_response(f"Question {name}", options=vals)
            else:
                payload[name] = random.choice(vals)

        # Retry Logic (Max 3 attempts)
        for attempt in range(3):
            try:
                time.sleep(random.uniform(0.1, 0.5))
                response = requests.post(endpoint, data=payload, timeout=15)
                if response.status_code in [200, 302]:
                    log_callback(f"Response {index+1} submitted successfully.")
                    submitted_count[0] += 1
                    if progress_callback:
                        progress_callback(submitted_count[0], num_responses)
                    return True
            except Exception as e:
                if attempt == 2: log_callback(f"Response {index+1} FAILED after 3 attempts: {e}")
        return False

    log_callback(f"Launching {num_responses} responses in Speed Mode...")
    
    max_workers = min(num_responses, 10)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(submit_one, i) for i in range(num_responses)]
        concurrent.futures.wait(futures)

    log_callback("Speed Mode batch completed.")

if __name__ == "__main__":
    form_url = "https://divyansh1920.github.io/MRA/"
    run_speed_bot(form_url, 5)
