import requests

# ==== CONFIGURATION ====
LOGIN_URL = "http://localhost:9999/api/users/login/"
CREATE_CHALLENGE_URL = "http://localhost:9999/api/challenges/create/"
CREATE_CATEGORY_URL = "http://localhost:9999/api/challenges/categories/create/"

USERNAME = "useradmin1234"
PASSWORD = "admin!@A213dawda"


def create_category(token):
    headers = {
        "Authorization": f"Token {token}"
    }

    data = {
        "name" : "Reverse"
    }

    response = requests.post(CREATE_CATEGORY_URL, json=data, headers=headers)

    print("Status Code:", response.status_code)
    print("Response:", response.json())


# ==== STEP 2: CREATE CHALLENGE ====
def create_challenge(token):
    headers = {
        "Authorization": f"Token {token}"
    }

    # Form fields to send
    data = {
        "title": "Buffer Overflow 101",
        "description": "Exploit the provided binary.",
        "difficulty": "2",
        "flag": "flag{example_flag}",
        "category": "1",
    }

    # File upload — assumes `sample.txt` exists in same folder
    files = [
        ("attachments", ("sample.txt", open("sample.txt", "rb"), "text/plain")),
    ]

    response = requests.post(CREATE_CHALLENGE_URL, data=data, files=files, headers=headers)

    print("Status Code:", response.status_code)
    print(response.content)
    # print("Response:", response.json())

# ==== MAIN ====
if __name__ == "__main__":
    # token = get_token()
    # if token:
    token = "46ef675a7ae29a59ff2ecff40e31a0cb29b8d56429cb98f31295e66f59a4598a"
    create_category(token)
    create_challenge(token)

