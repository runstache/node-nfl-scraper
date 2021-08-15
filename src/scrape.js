const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./helpers/htmlhelper.js');
const playerhelper = require('./helpers/playerhelper.js');
const stathelper = require('./helpers/stathelper.js');
const drivehelper = require('./helpers/drivehelper.js');

var date_value = '20200401';
var weekNumber = '1';
var yearValue = '2020';
var seasonType = '2'

var gameId = '401220163'

//url = 'https://www.espn.com/nfl/schedule/_/week/' + weekNumber + '/year/' + yearValue + '/seasontype/' + seasonType;
//url = 'https://www.espn.com/nfl/boxscore/_/gameId/' + gameId;
//url = 'https://www.espn.com/nfl/player/_/id/3122840/deshaun-watson';
url = 'https://www.espn.com/nfl/matchup?gameId=401220235';
url = 'https://www.espn.com/nfl/playbyplay/_/gameId/401220235';

/*
client.get(url).then(({data}) => {

  const fs = require('fs');

  fs.writeFileSync('./output/drives.html', data, (err) => {
    if (err) {
      console.log(err);
    }
  })
});



//playerhelper.getPlayer(url).then(player => console.log(player));
/*
stathelper.getGameStats(url).then((stat) => {
  home_passing = stat.home_passing;
  console.log(stat);
});
*/

drivehelper.getDriveStats(url).then(stat => console.log(stat));

