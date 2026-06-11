#!/usr/bin/env python3
"""
Comprehensive backend API test for Zentor
Tests all 20 steps from the review request
"""
import requests
import json
import time
from io import BytesIO
from PIL import Image

# Base URL from frontend/.env
BASE_URL = "https://visual-creator-343.preview.emergentagent.com/api"

# Test data - using unique email with timestamp
timestamp = int(time.time())
TEST_USER = {
    "name": "Maria Silva",
    "email": f"maria.silva.{timestamp}@example.com",
    "password": "senha123"
}

# Global variables to store test data
token = None
user_id = None
uploaded_file_id = None
uploaded_file_url = None
story_id = None

def print_test(step, description):
    print(f"\n{'='*80}")
    print(f"STEP {step}: {description}")
    print('='*80)

def print_result(success, message, response=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if response:
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text[:500]}")
    print()

def test_step_1_register():
    """Step 1: POST /api/auth/register with unique email and 6+ char password"""
    global token, user_id
    print_test(1, "Register new user")
    
    response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    
    if response.status_code == 200:
        data = response.json()
        if "token" in data and "user" in data:
            user = data["user"]
            if all(k in user for k in ["id", "name", "email", "initials"]):
                token = data["token"]
                user_id = user["id"]
                print_result(True, f"User registered successfully. ID: {user_id}, Initials: {user['initials']}", response)
                return True
    
    print_result(False, "Registration failed or missing required fields", response)
    return False

def test_step_2_duplicate_register():
    """Step 2: POST /api/auth/register with same email → expect 400"""
    print_test(2, "Attempt duplicate registration")
    
    response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    
    if response.status_code == 400:
        print_result(True, "Duplicate registration correctly rejected with 400", response)
        return True
    
    print_result(False, f"Expected 400, got {response.status_code}", response)
    return False

def test_step_3_login():
    """Step 3: POST /api/auth/login with registered credentials → expect 200 with token"""
    global token
    print_test(3, "Login with correct credentials")
    
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    
    if response.status_code == 200:
        data = response.json()
        if "token" in data:
            token = data["token"]  # Update token
            print_result(True, "Login successful with token", response)
            return True
    
    print_result(False, "Login failed or missing token", response)
    return False

def test_step_4_wrong_password():
    """Step 4: POST /api/auth/login with wrong password → expect 401"""
    print_test(4, "Login with wrong password")
    
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrongpassword123"
    })
    
    if response.status_code == 401:
        print_result(True, "Wrong password correctly rejected with 401", response)
        return True
    
    print_result(False, f"Expected 401, got {response.status_code}", response)
    return False

def test_step_5_auth_me():
    """Step 5: GET /api/auth/me without token → 401. With token → user object"""
    print_test(5, "GET /api/auth/me with and without token")
    
    # Test without token
    response_no_token = requests.get(f"{BASE_URL}/auth/me")
    if response_no_token.status_code != 401:
        print_result(False, f"Without token: Expected 401, got {response_no_token.status_code}", response_no_token)
        return False
    
    print_result(True, "Without token: Correctly rejected with 401", response_no_token)
    
    # Test with token
    headers = {"Authorization": f"Bearer {token}"}
    response_with_token = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response_with_token.status_code == 200:
        data = response_with_token.json()
        if "user" in data:
            print_result(True, "With token: User object returned", response_with_token)
            return True
    
    print_result(False, "With token: Failed to get user object", response_with_token)
    return False

def test_step_6_apps_catalog():
    """Step 6: GET /api/apps/catalog → list of 6 apps; verify stories-videos is installed:true"""
    print_test(6, "GET /api/apps/catalog")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/apps/catalog", headers=headers)
    
    if response.status_code == 200:
        apps = response.json()
        if len(apps) == 6:
            stories_videos = next((app for app in apps if app["id"] == "stories-videos"), None)
            if stories_videos and stories_videos.get("installed") == True:
                print_result(True, f"Catalog has 6 apps, stories-videos is installed:true", response)
                return True
            else:
                print_result(False, "stories-videos not found or not installed", response)
                return False
        else:
            print_result(False, f"Expected 6 apps, got {len(apps)}", response)
            return False
    
    print_result(False, "Failed to get catalog", response)
    return False

def test_step_7_apps_installed():
    """Step 7: GET /api/apps/installed → list contains stories-videos with expiresInDays around 7"""
    print_test(7, "GET /api/apps/installed")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/apps/installed", headers=headers)
    
    if response.status_code == 200:
        apps = response.json()
        stories_videos = next((app for app in apps if app["id"] == "stories-videos"), None)
        if stories_videos:
            expires_days = stories_videos.get("expiresInDays", 0)
            if 6 <= expires_days <= 7:
                print_result(True, f"stories-videos found with expiresInDays={expires_days}", response)
                return True
            else:
                print_result(False, f"stories-videos expiresInDays={expires_days}, expected ~7", response)
                return False
        else:
            print_result(False, "stories-videos not found in installed apps", response)
            return False
    
    print_result(False, "Failed to get installed apps", response)
    return False

def test_step_8_subscriptions():
    """Step 8: GET /api/subscriptions → at least 1 entry for Stories Vídeos"""
    print_test(8, "GET /api/subscriptions")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/subscriptions", headers=headers)
    
    if response.status_code == 200:
        subs = response.json()
        stories_sub = next((sub for sub in subs if "Stories Vídeos" in sub.get("app", "")), None)
        if stories_sub:
            print_result(True, f"Found subscription for Stories Vídeos", response)
            return True
        else:
            print_result(False, "No subscription found for Stories Vídeos", response)
            return False
    
    print_result(False, "Failed to get subscriptions", response)
    return False

def test_step_9_install_app():
    """Step 9: POST /api/apps/install/avaliacoes-pro → verify catalog shows it installed and subscriptions has it"""
    print_test(9, "POST /api/apps/install/avaliacoes-pro")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/apps/install/avaliacoes-pro", headers=headers)
    
    if response.status_code == 200:
        print_result(True, "App installed successfully", response)
        
        # Verify in catalog
        catalog_response = requests.get(f"{BASE_URL}/apps/catalog", headers=headers)
        if catalog_response.status_code == 200:
            apps = catalog_response.json()
            avaliacoes = next((app for app in apps if app["id"] == "avaliacoes-pro"), None)
            if avaliacoes and avaliacoes.get("installed") == True:
                print_result(True, "avaliacoes-pro now shows installed:true in catalog")
            else:
                print_result(False, "avaliacoes-pro not showing as installed in catalog")
                return False
        
        # Verify in subscriptions
        subs_response = requests.get(f"{BASE_URL}/subscriptions", headers=headers)
        if subs_response.status_code == 200:
            subs = subs_response.json()
            avaliacoes_sub = next((sub for sub in subs if "Avaliações Pro" in sub.get("app", "")), None)
            if avaliacoes_sub:
                print_result(True, "avaliacoes-pro found in subscriptions")
                return True
            else:
                print_result(False, "avaliacoes-pro not found in subscriptions")
                return False
    
    print_result(False, "Failed to install app", response)
    return False

def test_step_10_uninstall_app():
    """Step 10: DELETE /api/apps/uninstall/avaliacoes-pro → verify it's gone from installed and subscriptions"""
    print_test(10, "DELETE /api/apps/uninstall/avaliacoes-pro")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{BASE_URL}/apps/uninstall/avaliacoes-pro", headers=headers)
    
    if response.status_code == 200:
        print_result(True, "App uninstalled successfully", response)
        
        # Verify not in installed
        installed_response = requests.get(f"{BASE_URL}/apps/installed", headers=headers)
        if installed_response.status_code == 200:
            apps = installed_response.json()
            avaliacoes = next((app for app in apps if app["id"] == "avaliacoes-pro"), None)
            if not avaliacoes:
                print_result(True, "avaliacoes-pro removed from installed apps")
            else:
                print_result(False, "avaliacoes-pro still in installed apps")
                return False
        
        # Verify not in subscriptions
        subs_response = requests.get(f"{BASE_URL}/subscriptions", headers=headers)
        if subs_response.status_code == 200:
            subs = subs_response.json()
            avaliacoes_sub = next((sub for sub in subs if "Avaliações Pro" in sub.get("app", "")), None)
            if not avaliacoes_sub:
                print_result(True, "avaliacoes-pro removed from subscriptions")
                return True
            else:
                print_result(False, "avaliacoes-pro still in subscriptions")
                return False
    
    print_result(False, "Failed to uninstall app", response)
    return False

def test_step_11_upload_file():
    """Step 11: POST /api/upload multipart with a small PNG → returns id+url. Then GET that URL and confirm content-type"""
    global uploaded_file_id, uploaded_file_url
    print_test(11, "POST /api/upload with PNG file")
    
    # Create a small test PNG image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    headers = {"Authorization": f"Bearer {token}"}
    files = {'file': ('test_image.png', img_bytes, 'image/png')}
    response = requests.post(f"{BASE_URL}/upload", headers=headers, files=files)
    
    if response.status_code == 200:
        data = response.json()
        if "id" in data and "url" in data:
            uploaded_file_id = data["id"]
            uploaded_file_url = data["url"]
            print_result(True, f"File uploaded. ID: {uploaded_file_id}, URL: {uploaded_file_url}", response)
            
            # Now GET the URL and verify content-type
            file_response = requests.get(uploaded_file_url)
            if file_response.status_code == 200:
                content_type = file_response.headers.get('content-type', '')
                if 'image/png' in content_type.lower():
                    print_result(True, f"File retrieved successfully with correct content-type: {content_type}")
                    return True
                else:
                    print_result(False, f"Content-type mismatch. Expected image/png, got {content_type}")
                    return False
            else:
                print_result(False, f"Failed to retrieve uploaded file. Status: {file_response.status_code}")
                return False
    
    print_result(False, "File upload failed", response)
    return False

def test_step_12_create_story():
    """Step 12: POST /api/stories with valid payload → returns story; thumbnail equals cover image url"""
    global story_id
    print_test(12, "POST /api/stories")
    
    story_payload = {
        "app_id": "stories-videos",
        "title": "Minha História de Teste",
        "format": "vertical",
        "scroll": "auto",
        "active": True,
        "cta": "Compre Agora",
        "media": [
            {
                "url": uploaded_file_url,
                "type": "image",
                "name": "test_image.png",
                "cover": True
            }
        ],
        "urls": [
            {
                "value": "/produtos",
                "type": "contem",
                "ignore_params": False
            }
        ]
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/stories", headers=headers, json=story_payload)
    
    if response.status_code == 200:
        data = response.json()
        if "id" in data:
            story_id = data["id"]
            thumbnail = data.get("thumbnail")
            if thumbnail == uploaded_file_url:
                print_result(True, f"Story created. ID: {story_id}, thumbnail matches cover image", response)
                return True
            else:
                print_result(False, f"Thumbnail mismatch. Expected {uploaded_file_url}, got {thumbnail}", response)
                return False
    
    print_result(False, "Story creation failed", response)
    return False

def test_step_13_list_stories():
    """Step 13: GET /api/stories?app_id=stories-videos → contains the created story"""
    print_test(13, "GET /api/stories?app_id=stories-videos")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/stories?app_id=stories-videos", headers=headers)
    
    if response.status_code == 200:
        stories = response.json()
        found_story = next((s for s in stories if s["id"] == story_id), None)
        if found_story:
            print_result(True, f"Created story found in list", response)
            return True
        else:
            print_result(False, f"Created story not found in list", response)
            return False
    
    print_result(False, "Failed to list stories", response)
    return False

def test_step_14_get_story():
    """Step 14: GET /api/stories/{id} → returns the story"""
    print_test(14, f"GET /api/stories/{story_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/stories/{story_id}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("id") == story_id:
            print_result(True, "Story retrieved successfully", response)
            return True
    
    print_result(False, "Failed to get story", response)
    return False

def test_step_15_update_story():
    """Step 15: PUT /api/stories/{id} with updated title → returns updated story"""
    print_test(15, f"PUT /api/stories/{story_id} with updated title")
    
    updated_payload = {
        "app_id": "stories-videos",
        "title": "Título Atualizado",
        "format": "vertical",
        "scroll": "auto",
        "active": True,
        "cta": "Compre Agora",
        "media": [
            {
                "url": uploaded_file_url,
                "type": "image",
                "name": "test_image.png",
                "cover": True
            }
        ],
        "urls": [
            {
                "value": "/produtos",
                "type": "contem",
                "ignore_params": False
            }
        ]
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{BASE_URL}/stories/{story_id}", headers=headers, json=updated_payload)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("title") == "Título Atualizado":
            print_result(True, "Story updated successfully", response)
            return True
        else:
            print_result(False, f"Title not updated. Got: {data.get('title')}", response)
            return False
    
    print_result(False, "Failed to update story", response)
    return False

def test_step_16_toggle_story():
    """Step 16: PATCH /api/stories/{id}/toggle → flips active and returns {active: bool}"""
    print_test(16, f"PATCH /api/stories/{story_id}/toggle")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First toggle (should become False)
    response1 = requests.patch(f"{BASE_URL}/stories/{story_id}/toggle", headers=headers)
    
    if response1.status_code == 200:
        data1 = response1.json()
        if "active" in data1 and data1["active"] == False:
            print_result(True, f"First toggle: active={data1['active']}", response1)
            
            # Second toggle (should become True again)
            response2 = requests.patch(f"{BASE_URL}/stories/{story_id}/toggle", headers=headers)
            if response2.status_code == 200:
                data2 = response2.json()
                if data2["active"] == True:
                    print_result(True, f"Second toggle: active={data2['active']}", response2)
                    return True
    
    print_result(False, "Toggle failed", response1)
    return False

def test_step_17_delete_story():
    """Step 17: DELETE /api/stories/{id} → ok; subsequent GET returns 404"""
    print_test(17, f"DELETE /api/stories/{story_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{BASE_URL}/stories/{story_id}", headers=headers)
    
    if response.status_code == 200:
        print_result(True, "Story deleted successfully", response)
        
        # Verify GET returns 404
        get_response = requests.get(f"{BASE_URL}/stories/{story_id}", headers=headers)
        if get_response.status_code == 404:
            print_result(True, "Subsequent GET correctly returns 404")
            return True
        else:
            print_result(False, f"Expected 404, got {get_response.status_code}", get_response)
            return False
    
    print_result(False, "Failed to delete story", response)
    return False

def test_step_18_update_profile():
    """Step 18: PUT /api/profile with new name → returns user with updated initials"""
    print_test(18, "PUT /api/profile with new name")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{BASE_URL}/profile", headers=headers, json={"name": "João Pedro Santos"})
    
    if response.status_code == 200:
        data = response.json()
        user = data.get("user", {})
        if user.get("name") == "João Pedro Santos":
            initials = user.get("initials")
            if initials == "JS":  # João Santos
                print_result(True, f"Profile updated. New initials: {initials}", response)
                return True
            else:
                print_result(False, f"Initials incorrect. Expected JS, got {initials}", response)
                return False
    
    print_result(False, "Failed to update profile", response)
    return False

def test_step_19_feedback():
    """Step 19: POST /api/feedback with rating=5 → ok. With rating=10 → 422 validation error"""
    print_test(19, "POST /api/feedback with valid and invalid ratings")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Valid feedback
    response_valid = requests.post(f"{BASE_URL}/feedback", headers=headers, json={
        "rating": 5,
        "text": "Excelente aplicativo! Muito útil e fácil de usar."
    })
    
    if response_valid.status_code == 200:
        print_result(True, "Valid feedback (rating=5) accepted", response_valid)
    else:
        print_result(False, "Valid feedback rejected", response_valid)
        return False
    
    # Invalid feedback (rating=10)
    response_invalid = requests.post(f"{BASE_URL}/feedback", headers=headers, json={
        "rating": 10,
        "text": "Invalid rating"
    })
    
    if response_invalid.status_code == 422:
        print_result(True, "Invalid feedback (rating=10) correctly rejected with 422", response_invalid)
        return True
    else:
        print_result(False, f"Expected 422, got {response_invalid.status_code}", response_invalid)
        return False

def test_step_20_list_files():
    """Step 20: GET /api/files (Bearer) → lists the uploaded file"""
    print_test(20, "GET /api/files")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/files", headers=headers)
    
    if response.status_code == 200:
        files = response.json()
        found_file = next((f for f in files if f["id"] == uploaded_file_id), None)
        if found_file:
            print_result(True, f"Uploaded file found in list", response)
            return True
        else:
            print_result(False, "Uploaded file not found in list", response)
            return False
    
    print_result(False, "Failed to list files", response)
    return False

def main():
    print("\n" + "="*80)
    print("ZENTOR BACKEND API COMPREHENSIVE TEST")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User: {TEST_USER['email']}")
    print("="*80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Step 1: Register", test_step_1_register()))
    results.append(("Step 2: Duplicate Register", test_step_2_duplicate_register()))
    results.append(("Step 3: Login", test_step_3_login()))
    results.append(("Step 4: Wrong Password", test_step_4_wrong_password()))
    results.append(("Step 5: Auth Me", test_step_5_auth_me()))
    results.append(("Step 6: Apps Catalog", test_step_6_apps_catalog()))
    results.append(("Step 7: Apps Installed", test_step_7_apps_installed()))
    results.append(("Step 8: Subscriptions", test_step_8_subscriptions()))
    results.append(("Step 9: Install App", test_step_9_install_app()))
    results.append(("Step 10: Uninstall App", test_step_10_uninstall_app()))
    results.append(("Step 11: Upload File", test_step_11_upload_file()))
    results.append(("Step 12: Create Story", test_step_12_create_story()))
    results.append(("Step 13: List Stories", test_step_13_list_stories()))
    results.append(("Step 14: Get Story", test_step_14_get_story()))
    results.append(("Step 15: Update Story", test_step_15_update_story()))
    results.append(("Step 16: Toggle Story", test_step_16_toggle_story()))
    results.append(("Step 17: Delete Story", test_step_17_delete_story()))
    results.append(("Step 18: Update Profile", test_step_18_update_profile()))
    results.append(("Step 19: Feedback", test_step_19_feedback()))
    results.append(("Step 20: List Files", test_step_20_list_files()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
