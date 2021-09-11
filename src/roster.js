const client = require('axios');
const htmlhelper = require('./helpers/htmlhelper.js');
const cheerio = require('cheerio');

const outputDirectory = 'output/rosters/';

const teams = ['atl', 'ari', 'bal', 'buf', 'car', 'cin', 'chi', 'cle', 'dal', 'den', 'det', 'gb', 'hou', 'ind', 'jax', 'kc', 'lac', 'lar',
'lv', 'mia', 'min', 'ne', 'no', 'nyj', 'nyg', 'phi', 'pit', 'sf', 'sea', 'tb', 'ten', 'wsh'];



for (var i = 0; i < teams.length; i++) {
  let team = teams[i];

  let url = 'https://www.espn.com/nfl/team/roster/_/name/' + team;

  let roster = [];
  client.get(url).then(({ data }) => {

    const $ = cheerio.load(data, { xmlMode: true });


    const rosterEntries = $('tbody > tr').map(async function (id, ele) {
      let entry = {};

      let columns = $(ele).find('td');
      let playerLink = $(columns.get(1)).html();

      let url = htmlhelper.getAttributeValue(playerLink, 'a', 'href');

      let name = htmlhelper.getHtml(playerLink, 'a');

      let positionSection = $(columns.get(2)).html();
      let position = htmlhelper.getHtml(positionSection, 'div.inline');

      entry.url = url;
      entry.name = name;
      entry.team = team;
      entry.position = position;

      roster.push(entry);
    }).get();


    const fs = require('fs');
    console.log('Writing Roster for ' + team);

    fs.writeFileSync(outputDirectory + team + '.json', JSON.stringify(roster));
  });



}