import urllib.request
import re

def get_channel_info(id):
    url = f"https://www.youtube.com/channel/{id}"
    try:
        with urllib.request.urlopen(url) as response:
            html = response.read().decode('utf-8')
            title_match = re.search(r'<title>(.*?)</title>', html)
            if title_match:
                return title_match.group(1)
    except Exception as e:
        return f"Error: {e}"
    return "Not Found"

print(f"UCu9e_C-g7f-sZgC_yN1HwDQ: {get_channel_info('UCu9e_C-g7f-sZgC_yN1HwDQ')}")
print(f"UCUj6rrhMTR9pipbAWBAMvUQ: {get_channel_info('UCUj6rrhMTR9pipbAWBAMvUQ')}")
