const client = require('axios');
const htmlhelper = require('./helpers/htmlhelper.js');
const cheerio = require('cheerio');
const drivehelper = require('./helpers/drivehelper.js');
const stathelper = require('./helpers/stathelper.js');
const teamhelper = require('./helpers/teamhelper.js');

var weekNumber = process.argv[2];
var yearValue = process.argv[3];
var seasonType = process.argv[4];
var scheduleOnly = parseInt(process.argv[5]);

var outputDirectory = 'output/games/';


let url = 'https://www.espn.com/nfl/schedule/_/week/' + weekNumber + '/year/' + yearValue + '/seasontype/' + seasonType;

client.get(url).then(({ data }) => {


  let schedule = htmlhelper.getHtml(data, '#sched-container');
  const $ = cheerio.load(schedule, { xmlMode: true });

  const games = $('tbody > tr').map(async function (id, ele) {
    let game = {};
    game.year = yearValue;
    game.weekNumber = weekNumber;

    switch (seasonType) {
      case 1:
        game.type = 'preseason';
        break;
      case 2:
        game.type = 'regular';
        break;
      case 3:
        game.type = 'postseason'
        break;
      default:
        game.type = 'regular';
        break;
    }

    let columns = $(ele).find('td');
    let away_team_section = $(columns.get(0)).html();
    let home_team_section = $(columns.get(1)).html();
    
    if (home_team_section && away_team_section) {
      let home_image_url = htmlhelper.getAttributeValue(home_team_section, 'img', 'src');
      let away_image_url = htmlhelper.getAttributeValue(away_team_section, 'img', 'src');
      game.awayteam = await drivehelper.getTeamAbbreviation(away_image_url);
      game.hometeam = await drivehelper.getTeamAbbreviation(home_image_url);
      let gameid_section = $(columns.get(2)).html();
      let gameid_url = htmlhelper.getAttributeValue(gameid_section, 'a', 'href');
      let parts = gameid_url.split('/');
      let length = parts.length;
      if (length > 0) {
        game.gameid = parts[length - 1];
      }
      if (scheduleOnly === 0) {
        console.log('Pulling Stats for ' + game.gameid);
        // Get the Stats
        boxscore_url = 'https://www.espn.com/nfl/boxscore/_/gameId/' + game.gameid;
        try {
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

        } catch (error) {

          console.log("Error Pulling Game Id: " + game.gameid);
          console.log(error);
        }
      } else {
        console.log('Outputing schedule for ' + game.gameid);
      }
      const fs = require('fs');
      // Output the game
      console.log('OUTPUTING GAME ' + game.gameid);
      fs.writeFileSync(outputDirectory + game.gameid + '.json', JSON.stringify(game));
      return game;
    } else {
      console.log("NO TEAMS FOUND.");
    }
  }).get();

  Promise.all(games);
});
