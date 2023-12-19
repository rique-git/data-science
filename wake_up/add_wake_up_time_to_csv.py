from datetime import datetime

with open("wake_up_data.csv", "r") as file:
    data = file.readlines()

    # Get the current date and time
    current_datetime = datetime.now()

    # Get date and time
    time = current_datetime.strftime("%H:%M")
    date = current_datetime.strftime("%d/%m/%Y")

    # Check if current date if already there
    # and if not add the data to the csv
    if data[-1].split(",")[0] != date:
        with open("wake_up_data.csv", "a") as file:
            file.write(f"\n{date},{time},,,,,,,,,,,,,")