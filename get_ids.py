import urllib.request
import re

def get_channel_id(handle):
    url = f"https://www.youtube.com/{handle}"
    try:
        with urllib.request.urlopen(url) as response:
            html = response.read().decode('utf-8')
            match = re.search(r'UC[a-zA-Z0-9_-]{22}', html)
            if match:
                return match.group(0)
    except Exception as e:
        return f"Error: {e}"
    return "Not Found"

# Decode handle manually for urllib if needed
# Dolby: @%EB%8F%8C%EB%B9%84%EA%B3%B5%ED%8F%AC%EB%9D%BC%EB%94%94%EC%98%A4
print(f"Dolby (Encoded): {get_channel_id('@%EB%8F%8C%EB%B9%84%EA%B3%B5%ED%8F%AC%EB%9D%BC%EB%94%94%EC%98%A4')}")
print(f"ChimChakMan: {get_channel_id('@ChimChakMan_Official')}")
