import axios from "axios";
import ejs from "ejs";
import express from "express";

const APP = express();
const PORT = 3000;
const API_KEY = "RGAPI-b19b7ed1-353e-408e-828d-aeeaa1983e4b";

APP.use(express.static("public"));
APP.use(express.urlencoded({ extended: true }));

APP.get("/", (req, res) => {
  res.render("index.ejs");
});

APP.post("/profile", async (req, res) => {
  const gameName = req.body.gameName;
  const tagLine = req.body.tagLine;

  try {
    const riotAccountData = await fetchRiotAccount(gameName, tagLine); // Fetches gameName, tagLine and puuid
    const summonerData = await fetchSummonerLevel(riotAccountData.puuid);
    const matchData = await fetchMatchIds(riotAccountData.puuid);
    const fullMatchData = await fetchMatches(matchData);

    // for (let i = 0; i < fullMatchData.length; i++) {
    //   for (let j = 0; j < 10; j++) {
    //     console.log(
    //       // `Match: ${i}, participant: ${fullMatchData[i].info.participants[j].summonerName}`
    //       // matches[0].metadata.participants
    //       console.table(fullMatchData[i].info.participants[j].teamId)
    //     );
    //   }
    // }

    res.render("index.ejs", {
      user: riotAccountData,
      summoner: summonerData,
      participants: fullMatchData,
    });
  } catch (error) {
    console.log(error);
  }
});

async function fetchRiotAccount(gameName, tagLine) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function fetchSummonerLevel(PUUID) {
  try {
    const response = await axios.get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function fetchMatchIds(PUUID) {
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?start=0&count=5&api_key=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function fetchMatches(matchIds) {
  let matches = [];

  try {
    for (var i = 0; i < matchIds.length; i++) {
      const response = await axios.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/${matchIds[i]}?api_key=${API_KEY}`
      );
      matches.push(response.data);
    }
    // console.log("Matches:");
    // console.table(matches[0].metadata.participants);
    return matches;
  } catch (error) {
    console.log(error);
  }
}

APP.listen(PORT, () => {
  console.log("Starting...");
});
