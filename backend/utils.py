import yaml
from datetime import datetime
import pytz

def check_if_ctf_is_started():
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    start_time_str = config['ctf']['start_time']
    time_zone = config['ctf']['time_zone']
    time_format = "%d-%m-%Y %H:%M"

    # Parse and localize start and end times
    tz = pytz.timezone(time_zone)
    start_time = tz.localize(datetime.strptime(start_time_str, time_format))
    
    now = datetime.now(tz)
    return now >= start_time

def check_if_ctf_is_finished():
    with open("config.yml", "r") as f:
        config = yaml.safe_load(f)

    end_time_str = config['ctf']['end_time']
    time_zone = config['ctf']['time_zone']
    time_format = "%d-%m-%Y %H:%M"

    # Parse and localize start and end times
    tz = pytz.timezone(time_zone)
    end_time = tz.localize(datetime.strptime(end_time_str, time_format))
    now = datetime.now(tz)
    
    return now > end_time
