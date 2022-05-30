import { teams } from "./static.js";

var myHeaders = new Headers();
myHeaders.append("x-rapidapi-key", "6c8e411e4f5dd379bda177cc507dcae0");
myHeaders.append("x-rapidapi-host", "v1.basketball.api-sports.io");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

function displayGames(games) {
  games.response.forEach((game) => makeGameCard(game));
}

function makeGameCard(game) {
  const container = document.getElementById("container");

  const gameCard = document.createElement("div");
  gameCard.className = "game-card";
  container.appendChild(gameCard);

  const awayTeam = makeTeamCard(game.teams.away);
  gameCard.appendChild(awayTeam);

  const scoreCard = makeScoreCard(game);
  gameCard.appendChild(scoreCard);

  const homeTeam = makeTeamCard(game.teams.home, true);
  gameCard.appendChild(homeTeam);
}

function makeTeamCard(team, reverse) {
  const teamCard = document.createElement("div");
  teamCard.className = "team-card";
  if (reverse) teamCard.style.flexDirection = "row-reverse";

  const logoWrapper = document.createElement("div");
  logoWrapper.className = "logo-wrapper";
  teamCard.appendChild(logoWrapper);

  const logo = document.createElement("img");
  logo.src = getLogo(team.name);
  logoWrapper.appendChild(logo);

  const teamInfo = document.createElement("div");
  teamInfo.className = "team-info";
  if (reverse) teamInfo.style.alignItems = "flex-end";
  teamCard.appendChild(teamInfo);

  const teamName = document.createElement("h2");
  teamName.className = "team-name";
  teamName.innerText = team.name;
  if (reverse) teamName.style.textAlign = "end";
  teamInfo.appendChild(teamName);

  const teamRecord = document.createElement("span");
  teamRecord.className = "team-record";
  const recordObj = getStats(team.id);
  teamRecord.innerText = recordObj.win.total + " - " + recordObj.lose.total;
  teamInfo.appendChild(teamRecord);

  return teamCard;
}

function makeScoreCard({ scores, status, time }) {
  const scoreCard = document.createElement("div");
  scoreCard.className = "score-card";

  const statusDiv = document.createElement("div");
  statusDiv.className = "status";
  statusDiv.innerText = status.long;
  scoreCard.appendChild(statusDiv);

  const scoreWrapper = document.createElement("div");
  scoreWrapper.className = "score-wrapper";
  scoreCard.appendChild(scoreWrapper);
  if (status.long == "Not Started") {
    scoreWrapper.innerText = time;
    return scoreCard;
  }

  const scoreAway = document.createElement("span");
  scoreAway.innerText = scores["away"]["total"] || 0;
  scoreWrapper.appendChild(scoreAway);

  const dash = document.createElement("span");
  dash.innerText = " - ";
  scoreWrapper.appendChild(dash);

  const scoreHome = document.createElement("span");
  scoreHome.innerText = scores["home"]["total"] || 0;
  scoreWrapper.appendChild(scoreHome);

  return scoreCard;
}

function getLogo(team) {
  let teamSplit = team.split(" ");
  let teamName = teamSplit[teamSplit.length - 1];
  if (teamName == "76ers") teamName = "Sixers";

  return `http://i.cdn.turner.com/nba/nba/.element/img/1.0/teamsites/logos/teamlogos_500x500/${teams[teamName]}.png`;
}

function getStats(teamID) {
  for (const teamStat of stats) {
    if (teamStat.team.id == teamID) return teamStat.games;
  }
}

async function fetchStats() {
  const response = await fetch(
    "https://v1.basketball.api-sports.io/standings?league=12&season=2021-2022",
    requestOptions
  );

  if (!response.ok) {
    throw new Error();
  }

  const stats = await response.json();

  return stats.response[0];
}

async function fetchGames() {
  let date = new Date().toISOString().substring(0, 10);

  fetch(
    `https://v1.basketball.api-sports.io/games?league=12&season=2021-2022&date=${date}&timezone=Europe/Berlin`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => displayGames(result))
    .catch((error) => console.log("error", error));
}

const stats = await fetchStats();
fetchGames();
