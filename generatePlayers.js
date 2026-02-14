import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.API_KEY;

const headers = {
  "x-apisports-key": API_KEY,
};

const leagues = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 292, name: "K League 1" },
];

const season = 2025;

async function fetchTeams(leagueId) {
  const url = `https://v3.football.api-sports.io/teams?league=${leagueId}&season=${season}`;

  const response = await fetch(url, { headers });
  const data = await response.json();

  console.log(`League ${leagueId} teams:`, data.response.length);

  return data.response || [];
}

async function fetchSquad(teamId) {
  const url = `https://v3.football.api-sports.io/players/squads?team=${teamId}`;

  const response = await fetch(url, { headers });
  const data = await response.json();

  if (!data.response || data.response.length === 0) {
    return [];
  }

  return data.response[0].players || [];
}

async function generatePlayers() {
  const allPlayers = [];

  for (const league of leagues) {
    console.log(`Fetching teams for ${league.name}`);

    const teams = await fetchTeams(league.id);

    for (const teamObj of teams) {
      const team = teamObj.team;

      console.log(`Fetching squad for ${team.name}`);

      const squad = await fetchSquad(team.id);

      for (const player of squad) {
        allPlayers.push({
          id: player.id,
          name: player.name,
          age: player.age,
          number: player.number,
          position: player.position,
          photo: player.photo,
          team: team.name,
          teamLogo: team.logo,
          league: league.name,
        });
      }

      // Small delay to avoid rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`Total players collected: ${allPlayers.length}`);

  fs.writeFileSync("player.json", JSON.stringify(allPlayers, null, 2));
}

generatePlayers();
