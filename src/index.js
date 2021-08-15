const client = require('axios');
const htmlhelper = require('./helpers/htmlhelper.js');
const cheerio = require('cheerio');
const drivehelper = require('./helpers/drivehelper.js');
const stathelper = require('./helpers/stathelper.js');
const teamhelper = require('./helpers/teamhelper.js');

var date_value = '20200401';
var weekNumber = '1';
var yearValue = '2020';
var seasonType = '2'

let url = 'https://www.espn.com/nfl/schedule/_/week/' + weekNumber + '/year/' + yearValue + '/seasontype/' + seasonType;

client.get(url).then(({ data }) => {


  let schedule = htmlhelper.getHtml(data, '#sched-container');
  const $ = cheerio.load(schedule, { xmlMode: true });

  const games = $('tbody > tr').map(async function (id, ele) {
    let game = {};
    game.year = yearValue;
    game.weekNumber = weekNumber;

    let columns = $(ele).find('td');
    let away_team_section = $(columns.get(0)).html();
    let away_image_url = htmlhelper.getAttributeValue(away_team_section, 'img', 'src');
    game.awayteam = await drivehelper.getTeamAbbreviation(away_image_url);

    let home_team_section = $(columns.get(1)).html();
    let home_image_url = htmlhelper.getAttributeValue(home_team_section, 'img', 'src');
    game.hometeam = await drivehelper.getTeamAbbreviation(home_image_url);

    let gameid_section = $(columns.get(2)).html();
    let gameid_url = htmlhelper.getAttributeValue(gameid_section, 'a', 'href');
    let parts = gameid_url.split('/');
    let length = parts.length;
    if (length > 0) {
      game.gameid = parts[length - 1];
    }

    // Get the Stats
    boxscore_url = 'https://www.espn.com/nfl/boxscore/_/gameId/' + game.gameid;
    let boxscore = await stathelper.getGameStats(boxscore_url);
    game.boxscore = boxscore;

    // Get matchup
    matchup_url = 'https://www.espn.com/nfl/matchup?gameId=' + game.gameid;
    let matchup = await teamhelper.getTeamStats(matchup_url);
    game.matchup = matchup;

    // Get Big Plays
    drive_url = 'https://www.espn.com/nfl/playbyplay/_/gameId/' + game.gameid;
    let bigplays = await drivehelper.getDriveStats(drive_url);
    game.bigplays = bigplays;

    const fs = require('fs');
    // Output the game
    console.log('OUTPUTING GAME ' + game.gameid);
    fs.writeFileSync('output/games/' + game.gameid + '.json', JSON.stringify(game));
    return game;
  }).get();
  Promise.all(games);
});