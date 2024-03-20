import axios from "axios";
import express from "express";

const APP = express();
const PORT = 3000;
const API_KEY = "RGAPI-b19b7ed1-353e-408e-828d-aeeaa1983e4b";
process.env.API_KEY;

const matchCount = 10;

APP.use(express.static("public"));
APP.use(express.urlencoded({ extended: true }));

APP.get("/", (req, res) => {
  res.render("index.ejs");
});

APP.post("/profile", async (req, res) => {
  const gameName = req.body.gameName;
  const tagLine = req.body.tagLine;

  const profilePuuid = await fetchRiotAccount(gameName, tagLine);

  try {
    const riotAccountData = await fetchRiotAccount(gameName, tagLine); // Fetches gameName, tagLine and puuid
    const summonerData = await fetchSummoner(riotAccountData.puuid);
    const matchData = await fetchMatchId(riotAccountData.puuid);
    const fullMatchData = await fetchMatchesById(matchData);
    const summonerRankedStatus = await fetchSummonerRankedProfile(summonerData);

    res.render("index.ejs", {
      user: riotAccountData,
      summoner: summonerData,
      participants: fullMatchData,
      rankedStatus: summonerRankedStatus,
    });
  } catch (e) {
    console.log(e);
  }
});

async function fetchRiotAccount(gameName, tagLine) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

// {
//   "id": "LZRAWJYP7bXJk8kHmNpokHdBuTixAY7Bgh57Wy-ewmOVHSU",
//   "accountId": "KNFbZab_thQ8dQnFYvJIutbenjk_mcEeFUNx0nhV-E2zyiU",
//   "puuid": "bt3T8ycBszZArTtQo_7Vw0qnaX_7dNVVPUVK87U5a9uU-FDIA5pbqsyaavWJUwx8ahrYhfYaBv4d_Q",
//   "name": "Kim Dong Sun",
//   "profileIconId": 1637,
//   "revisionDate": 1710869646000,
//   "summonerLevel": 519
// }
async function fetchSummoner(puuid) {
  try {
    const response = await axios.get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

async function fetchMatchId(puuid) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&$count=${matchCount}&api_key=${API_KEY}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

async function fetchMatchesById(matchList) {
  let matches = [];

  try {
    for (let i = 0; i < matchCount; i++) {
      const response = await axios.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/${matchList[i]}?api_key=${API_KEY}`
      );
      matches.push(response.data);
    }
    return matches;
  } catch (e) {
    console.log(e);
  }
}

async function fetchSummonerRankedProfile(summonerData) {
  try {
    const response = await axios.get(
      `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${API_KEY}`
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

APP.listen(PORT, () => {
  console.log("Starting...");
});
