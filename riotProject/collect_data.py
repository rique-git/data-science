import argparse
import requests
from datetime import datetime

parser = argparse.ArgumentParser()

# Add positional arguments
parser.add_argument('username', type=str, help='Specify a riot EUW username')
parser.add_argument('riotAPIkey', type=str, help='Specify a riot API key')

# Parse the command-line arguments
args = parser.parse_args()

# Access the arguments
username = args.username
riotAPIkey = args.riotAPIkey

# Your script logic using the arguments
print(f"EUW username specified: {username}")
print(f"Riot API key specified: {riotAPIkey}")


# Create request key to SummonerV4 API
SummonerV4_URL_request_key = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + username + "?api_key=" + riotAPIkey

# Send request to SummonerV4 (success = 200)
resp = requests.get(SummonerV4_URL_request_key)
print("\nRequest to SummonerV4 :", resp)

# Get player PUIID
player_puuid = resp.json()["puuid"]
print("Player PUUID          :", player_puuid)

# Send request to MatchV5 (success = 200)
request_match_api = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/_G2gRRCcbjdmZD1a54PdNPQl7zTSrbHsujrLJRwUAu50GKwvr44eARdP20y22sIxVeP0_YD0Ydyflw/ids?start=0&count=100"
matchV5_request_key = request_match_api + "&api_key=" + riotAPIkey
resp = requests.get(matchV5_request_key)
print("\nRequest to MatchV5    :", resp, "\n")

# List of matches ids
matches_ids = resp.json()

games_info = []
for match_id in matches_ids[:20]:
    request_match_link = "https://europe.api.riotgames.com/lol/match/v5/matches/" + match_id + "?api_key=" + riotAPIkey
    resp = requests.get(request_match_link)
    print("Request to MatchV5 matches :", resp)
    games_info.append(resp)


for i in games_info:
    game_info = i.json()

    date = datetime.fromtimestamp(int(str(game_info["info"]["gameCreation"])[:10]))
    game_type = game_info["info"]["gameMode"]

#    print("------Blue Team-------")
#    for player in game_info["info"]["participants"]:
#        if player["teamId"] == 100:
#            print("player =", player["summonerName"])
#            print("champion =", player["championName"])
#            print("position =", player["teamPosition"], "\n")




