import pandas as pd
import subprocess
import warnings

# Disable all warnings
warnings.filterwarnings("ignore")

def get_yes_no_input(question):
    while True:
        answer = input(f"{question}: ").lower()
        if answer in ["yes", "no"]:
            return answer
        else:
            raise ValueError("Invalid input. Please enter 'yes' or 'no'.")

# Define the list of questions
questions = [
    "Did you RUN today? [yes/no]",
    "Did you CLIMB today? [yes/no]",
    "Did you do a COMPLEMENTARY WORKOUT today? [yes/no]",
    "Did you take CREATINE today? [yes/no]",
    "Did you take a PROTEIN shake today? [yes/no]",
    "Did you take a COLD SHOWER today? [yes/no]",
    "Did you READ today? [yes/no]",
    "Did you play VIDEO GAMES today? [yes/no]",
    "Did you WORK today? [yes/no]",
    "Did you HANG OUT with friends [yes/no]"
]

# Get yes/no input for each question
answers = [get_yes_no_input(question) for question in questions]

# Additional input for non-yes/no questions
answers.append(input("What NEW SKILL did you train today?: "))
answers.append(float(input("How much WATER in L did you drink today?: ")))
answers.append(float(input("Finally, HOW WAS YOUR DAY from 1 to 5?: [Excelent: 5/Good: 4/Satisfactory: 3/Fair: 2/Unsatisfactory: 1]: ")))


# Run add_wake_up_time_to_csv in case I forgot
subprocess.run(['python3', 'add_wake_up_time_to_csv.py'])

# Open data as a dataframe
data = pd.read_csv("wake_up_data.csv", index_col="date")

# Select columns I want to change
filtered_columns = data.drop(columns = ["wake-up time"]).columns

# Update df with new values
last_row = data.iloc[-1]
for c, col in enumerate(filtered_columns):
    last_row[col] = answers[c]

data.iloc[-1] = last_row

# Export df as a csv
data.to_csv("wake_up_data.csv", index="date")
