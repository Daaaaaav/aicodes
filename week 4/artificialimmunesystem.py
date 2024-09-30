import random
from datetime import datetime, timedelta

class User:
    def __init__(self, username):
        self.username = username
        self.login_times = [] 
        self.devices = set()  
        self.locations = set() 

    def add_login(self, login_time, device, location):
        self.login_times.append(login_time)
        self.devices.add(device)
        self.locations.add(location)

    def calculate_normalcy_score(self, login_time, device, location):
        time_score = max(
            1 - abs((login_time - known_time).seconds) / 86400 for known_time in self.login_times
        ) if self.login_times else 0
        device_score = 1 if device in self.devices else 0
        location_score = 1 if location in self.locations else 0
        return (time_score + device_score + location_score) / 3

user_profiles = {
    'toru': User('toru'),
    'madoka': User('madoka')
}

user_profiles['toru'].add_login(datetime.now() - timedelta(hours=1), 'laptop', '192.168.11.1')
user_profiles['madoka'].add_login(datetime.now() - timedelta(days=1), 'laptop', '192.168.11.1')
user_profiles['toru'].add_login(datetime.now() - timedelta(days=1), 'mobile', '192.168.11.2')

def authenticate_user(username, login_time, device, location):
    user = user_profiles.get(username)
    if not user:
        print(f"Authentication failed: {username} not found.")
        return

    score = user.calculate_normalcy_score(login_time, device, location)
    threshold = 0.5  

    if score >= threshold:
        print(f"Authentication successful for {username}. Normalcy Score: {score:.2f}")
    else:
        print(f"Authentication suspicious for {username}. Normalcy Score: {score:.2f}")

authenticate_user('madoka', datetime.now(), 'laptop', '192.168.11.1')  
authenticate_user('toru', datetime.now(), 'unknown_device', 'unknown_location')  