import argparse
import requests
from datetime import datetime
import pandas as pd 


data = pd.read_csv("games_data.csv", index_col="datetime")
data = data.head(0)

parser = argparse.ArgumentParser()

# Add positional arguments
parser.add_argument('username', nargs='+', type=str, help='Specify a riot EUW username')
parser.add_argument('riotAPIkey', type=str, help='Specify a riot API key')

# Parse the command line arguments
args = parser.parse_args()

# Access the values
username = ' '.join(args.username)
riotAPIkey = args.riotAPIkey

print(f'Username: {username}')
print(f'API Key: {riotAPIkey}')


# Create request key to SummonerV4 API
SummonerV4_URL_request_key = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + username + "?api_key=" + riotAPIkey

# Send request to SummonerV4 (success = 200)
resp = requests.get(SummonerV4_URL_request_key)
print("\nRequest to SummonerV4 :", resp)

# Get player PUIID
player_puuid = resp.json()["puuid"]
print("Player PUUID          :", player_puuid)

# Send request to MatchV5 (success = 200)
request_match_api = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + player_puuid + "/ids?start=0&count=100"
matchV5_request_key = request_match_api + "&api_key=" + riotAPIkey
resp = requests.get(matchV5_request_key)
print("\nRequest to MatchV5    :", resp, "\n")

# List of matches ids
matches_ids = resp.json()

games_info = []
for match_id in matches_ids[:-1]:
    request_match_link = "https://europe.api.riotgames.com/lol/match/v5/matches/" + match_id + "?api_key=" + riotAPIkey
    resp = requests.get(request_match_link)
    print("Request to MatchV5 matches :", resp)
    if resp.status_code == 200:
        games_info.append(resp)
    else:
        print("game not added")


for i in games_info:
    game_info = i.json()
    
    if game_info["info"]["gameMode"] != "CLASSIC" and game_info["info"]["gameMode"] != "ARAM":
        continue
    date = datetime.fromtimestamp(int(str(game_info["info"]["gameCreation"])[:10]))
    game_type = game_info["info"]["gameMode"]

    blue_team = []
    red_team = []
    blue_team_names = []
    red_team_names = []

    for player in game_info["info"]["participants"]:
        if player["summonerName"] == username:
            if player["teamId"] == 100:
                team = "blue"
            else:
                team = "red"
            champion = player["championName"]
            position = player["teamPosition"]
            if position == "UTILITY":
                position = "SUPPORT"
            win = player["win"]

        elif player["teamId"] == 100:
            blue_team.append(player["championName"])
            blue_team_names.append(player["summonerName"])
        else:
            red_team.append(player["championName"])
            red_team_names.append(player["summonerName"])
    


    # Create CSV with data
    #datetime,game type,champion played,team,position,win,alied1,alied2,alied3,alied4,enemy1,enemy2,enemy3,enemy4,enemy5


    if len(blue_team) == 4: 
        alied_team = blue_team
        enemy_team = red_team
        alied_team_names = blue_team_names
        enemy_team_names = red_team_names
    else:
        alied_team = red_team
        enemy_team = blue_team
        alied_team_names = red_team_names
        enemy_team_names = blue_team_names
            
    new_row_data = {'game type': game_type, 'champion played': champion, 'team': team, 'position': position\
                    , 'win': win, 'alied1': alied_team[0], 'alied2': alied_team[1], 'alied3': alied_team[2], 'alied4': alied_team[3]\
                    , 'enemy1': enemy_team[0], 'enemy2': enemy_team[1], 'enemy3': enemy_team[2], 'enemy4': enemy_team[3], 'enemy5': enemy_team[4]\
                    , 'alied1name': alied_team_names[0], 'alied2name': alied_team_names[1], 'alied3name': alied_team_names[2], 'alied4name': alied_team_names[3]\
                    , 'enemy1name': enemy_team_names[0], 'enemy2name': enemy_team_names[1], 'enemy3name': enemy_team_names[2], 'enemy4name': enemy_team_names[3], 'enemy5name': enemy_team_names[4]}
    data.loc[date] = new_row_data

data.to_csv("games_data.csv", index=True)






