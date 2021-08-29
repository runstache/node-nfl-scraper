const client = require('axios');
const htmlhelper = require('./htmlhelper.js');
const cheerio = require('cheerio');

async function getDriveStats(drive_url) {
  const { data } = await client.get(drive_url);


  let drive_summary = htmlhelper.getHtml(data, '#gamepackage-drives-wrap');

  const $ = cheerio.load(drive_summary, { xmlMode: true });

  const drive_stats = $('li.accordion-item').map(async function (id, ele) {
    let body = $(this).html();
    let image_url = htmlhelper.getAttributeValue(body, 'img', 'src');
    let bigplay = {};
    let run = 0;
    let pass = 0;
    let turnover = 0;

    let drive_title = htmlhelper.getValue(body, 'span.headline', 0);
    if (drive_title.toLowerCase().includes('blocked') || drive_title.toLowerCase().includes('downs') || drive_title.toLowerCase().includes('missed')) {
      turnover++;
    }
    
    if (image_url) {
      let team = await getTeamAbbreviation(image_url);

      let bigplays = await getBigPlays(body);

      

      if (bigplays) {
        for (let i = 0; i < bigplays.length; i++) {
          let play = bigplays[i];
          if (play === 'PASS') {
            pass++;
          }
          if (play === 'RUN') {
            run++;
          }
          if (play === 'TURNOVER') {
            turnover++;
          }
        }
      }
      bigplay.team = team;
      bigplay.pass = pass;
      bigplay.run = run;
      bigplay.turnover = turnover;
    } else {
      bigplay.team = '';
      bigplay.pass = pass;
      bigplay.run = run;
      bigplay.turnover = turnover;
    }
    return bigplay;

  }).get();

  return Promise.all(drive_stats);
}

async function getTeamAbbreviation(url) {
  let parts = url.split('/');
  if (parts && parts.length > 0) {
    let length = parts.length;
    let lastPiece = parts[length - 1];
    let pieces = lastPiece.split('&');
    if (pieces && pieces.length > 0) {
      return pieces[0].replace('.png', '');
    } else {
      return url;
    }
  } else {
    return url;
  }
}

async function getBigPlays(section) {
  let drivelist = htmlhelper.getHtml(section, 'ul.drive-list');
  if (drivelist) {
    const $ = cheerio.load(drivelist, { xmlMode: true });

    const bigplays = $('li').map(async function (id, ele) {
      let body = $(this).html();
      let playtext = htmlhelper.getHtml(body, 'span.post-play');
      return await findPlay(playtext);

    }).get();
    return Promise.all(bigplays);
  } else {
    return Promise.all([]);
  }

}

async function findPlay(playtext) {
  let yards = await getYards(playtext);

  if (playtext.toLowerCase().includes('pass') && yards >= 15) {
    return 'PASS';
  }

  if (!playtext.toLowerCase().includes('pass') && yards >= 10) {
    return 'RUN';
  }

  return 'NONE';

}

async function getYards(playText) {
  if (playText.toLowerCase().includes('no play') || playText.toLowerCase().includes('penalty') || playText.toLowerCase().includes('kick') || playText.toLowerCase().includes('punt')) {
    return 0;
  } else {

    var regex = /for \d+ yards/g;
    var regex2 = /for \d+ yds/g;
    var matches = playText.match(regex);
    var yardage = 0;
    if (matches && matches != null && matches.length > 0) {
      yardage = matches[0].replace('yards', '').replace('for', '').replace(/[\t\n\r]/gm, '');
    } else {
      matches = playText.match(regex2);
      if (matches && matches != null && matches.length > 0) {
        yardage = matches[0].replace('yds', '').replace('for', '').replace(/[\t\n\r]/gm, '');
      } else {
        return 0;
      }
    }
    return parseInt(yardage);
  }
}

exports.getDriveStats = getDriveStats;
exports.getTeamAbbreviation = getTeamAbbreviation