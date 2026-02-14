
import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.API_KEY;
const SEASON = 2025;



// Big 5 + K League 1
const LEAGUES = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 292, name: "K League 1" }
];

if (!API_KEY) {
  console.error("API_KEY is missing.");
  process.exit(1);
}

async function fetchLeaguePlayers(leagueId, leagueName) {
  let page = 1;
  let allPlayers = [];

  while (true) {
    console.log(`Fetching ${leagueName} page ${page}`);

    const response = await fetch(
      `https://v3.football.api-sports.io/players?league=${leagueId}&season=${SEASON}&page=${page}`,
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    if (!response.ok) {
      console.error(`Error fetching ${leagueName}`);
      break;
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) break;

    for (const p of data.response) {
      if (!p.player || !p.statistics || p.statistics.length === 0) continue;

      const info = p.player;
      const stats = p.statistics[0];

      if (!stats.team || !stats.games) continue;

      allPlayers.push({
        name: info.name,
        club: stats.team.name,
        league: leagueName,
        nationality: info.nationality,
        position: stats.games.position,
        age: info.age
      });
    }

    page++;
  }

  return allPlayers;
}

async function generate() {
  let combined = [];

  for (const league of LEAGUES) {
    const players = await fetchLeaguePlayers(league.id, league.name);
    combined = combined.concat(players);
  }

  // Remove duplicates
  const uniquePlayers = Array.from(
    new Map(combined.map(p => [p.name + "_" + p.club, p])).values()
  );

  fs.writeFileSync("player.json", JSON.stringify(uniquePlayers, null, 2));

  console.log(`Saved ${uniquePlayers.length} players to player.json`);
}

generate();

