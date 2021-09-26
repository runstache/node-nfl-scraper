const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./htmlhelper.js');
const playerhelper = require('./playerhelper.js');


async function getGameStats(boxscore_url) {

  const { data } = await client.get(boxscore_url);

  var stat = {};

  // Get the Passing
  let passing_section = htmlhelper.getHtml(data, '#gamepackage-passing');
  let home_passing = htmlhelper.getHtml(passing_section, 'div.gamepackage-home-wrap');
  let away_passing = htmlhelper.getHtml(passing_section, 'div.gamepackage-away-wrap');

  let home_passing_stats = await getPassing(home_passing);
  let away_passing_stats = await getPassing(away_passing);


  stat.homePassing = home_passing_stats;
  stat.awayPassing = away_passing_stats;

  let rushing_section = htmlhelper.getHtml(data, '#gamepackage-rushing');
  let home_rushing = htmlhelper.getHtml(rushing_section, 'div.gamepackage-home-wrap');
  let away_rushing = htmlhelper.getHtml(rushing_section, 'div.gamepackage-away-wrap');

  let home_rushing_stats = await getRushing(home_rushing);
  let away_rushing_stats = await getRushing(away_rushing);

  stat.homeRushing = home_rushing_stats;
  stat.awayRushing = away_rushing_stats;

  //Get Receiving

  let receiving_section = htmlhelper.getHtml(data, '#gamepackage-receiving');
  let home_receiving = htmlhelper.getHtml(receiving_section, 'div.gamepackage-home-wrap');
  let away_receiving = htmlhelper.getHtml(receiving_section, 'div.gamepackage-away-wrap');

  let home_receiving_stats = await getReceiving(home_receiving);
  let away_receiving_stats = await getReceiving(away_receiving);

  stat.homeReceiving = home_receiving_stats;
  stat.awayReceiving = away_receiving_stats;

  // Get Fumbles

  let fumbles_section = htmlhelper.getHtml(data, '#gamepackage-fumbles');
  let home_fumbles = htmlhelper.getHtml(fumbles_section, 'div.gamepackage-home-wrap');
  let away_fumbles = htmlhelper.getHtml(fumbles_section, 'div.gamepackage-away-wrap');

  let home_fumbles_stats = await getFumbles(home_fumbles);
  let away_fumbles_stats = await getFumbles(away_fumbles);

  stat.homeFumbles = home_fumbles_stats;
  stat.awayFumbles = away_fumbles_stats;


  // Get Defense

  let defense_section = htmlhelper.getHtml(data, '#gamepackage-defensive');
  let home_defense = htmlhelper.getHtml(defense_section, 'div.gamepackage-home-wrap');
  let away_defense = htmlhelper.getHtml(defense_section, 'div.gamepackage-away-wrap');

  let home_defense_stats = await getDefense(home_defense);
  let away_defense_stats = await getDefense(away_defense);

  stat.homeDefense = home_defense_stats;
  stat.awayDefense = away_defense_stats;

  // Get Interceptions

  let interceptions_section = htmlhelper.getHtml(data, '#gamepackage-interceptions');
  let home_interceptions = htmlhelper.getHtml(interceptions_section, 'div.gamepackage-home-wrap');
  let away_interceptions = htmlhelper.getHtml(interceptions_section, 'div.gamepackage-away-wrap');

  let home_interceptions_stats = await getInterceptions(home_interceptions);
  let away_interceptions_stats = await getInterceptions(away_interceptions);

  stat.homeInterceptions = home_interceptions_stats;
  stat.awayInterceptions = away_interceptions_stats;


  // Get Kick Returns
  let kickReturns_section = htmlhelper.getHtml(data, '#gamepackage-kickReturns');
  let home_kickReturns = htmlhelper.getHtml(kickReturns_section, 'div.gamepackage-home-wrap');
  let away_kickReturns = htmlhelper.getHtml(kickReturns_section, 'div.gamepackage-away-wrap');

  let home_kickReturns_stats = await getKickReturns(home_kickReturns);
  let away_kickReturns_stats = await getKickReturns(away_kickReturns);

  stat.homeKickReturns = home_kickReturns_stats;
  stat.awayKickReturns = away_kickReturns_stats;

  // Get Punt Returns
  let puntReturns_section = htmlhelper.getHtml(data, '#gamepackage-puntReturns');
  let home_puntReturns = htmlhelper.getHtml(puntReturns_section, 'div.gamepackage-home-wrap');
  let away_puntReturns = htmlhelper.getHtml(puntReturns_section, 'div.gamepackage-away-wrap');

  let home_puntReturns_stats = await getPuntReturns(home_puntReturns);
  let away_puntReturns_stats = await getPuntReturns(away_puntReturns);

  stat.homePuntReturns = home_puntReturns_stats;
  stat.awayPuntReturns = away_puntReturns_stats;

  // Get Kicking

  let kicking_section = htmlhelper.getHtml(data, '#gamepackage-kicking');
  let home_kicking = htmlhelper.getHtml(kicking_section, 'div.gamepackage-home-wrap');
  let away_kicking = htmlhelper.getHtml(kicking_section, 'div.gamepackage-away-wrap');

  let home_kicking_stats = await getKicking(home_kicking);
  let away_kicking_stats = await getKicking(away_kicking);

  stat.homeKicking = home_kicking_stats;
  stat.awayKicking = away_kicking_stats;

  // Get Punting
  let punting_section = htmlhelper.getHtml(data, '#gamepackage-punting');
  let home_punting = htmlhelper.getHtml(punting_section, 'div.gamepackage-home-wrap');
  let away_punting = htmlhelper.getHtml(punting_section, 'div.gamepackage-away-wrap');

  let home_punting_stats = await getPunting(home_punting);
  let away_punting_stats = await getPunting(away_punting);

  stat.homePunting = home_punting_stats;
  stat.awayPunting = away_punting_stats;


  return stat;
}

async function getPassing(passing_table) {

  // Get the Table Body
  let table_body = htmlhelper.getHtml(passing_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const passing_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
    let player = await playerhelper.getPlayer(player_url);

    stat.player = player;

    let c_att = htmlhelper.getHtml(body, 'td.c-att');
    if (c_att) {
      let parts = c_att.split('/');
      stat.completions = parts[0];
      stat.attempts = parts[1];
    } else {
      stat.attempts = 0;
      stat.completions = 0;
    }

    let sacks = htmlhelper.getHtml(body, 'td.sacks');
    if (sacks) {
      let parts = sacks.split('-');
      stat.sacks = parts[0];
    } else {
      stat.sacks = 0;
    }

    stat.yards = htmlhelper.getHtml(body, 'td.yds');
    stat.passingAverage = htmlhelper.getHtml(body, 'td.avg');
    stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    stat.interceptions = htmlhelper.getHtml(body, 'td.int');
    stat.qbrating = htmlhelper.getHtml(body, 'td.qbr');
    stat.rating = htmlhelper.getHtml(body, 'td.rtg');
    return stat;
  }).get();

  return Promise.all(passing_stats);
}

async function getRushing(rushing_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(rushing_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const rushing_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
    let player = await playerhelper.getPlayer(player_url);

    stat.player = player;

    stat.yards = htmlhelper.getHtml(body, 'td.yds');
    stat.rushingAverage = htmlhelper.getHtml(body, 'td.avg');
    stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    stat.carries = htmlhelper.getHtml(body, 'td.car');
    stat.longrush = htmlhelper.getHtml(body, 'td.long');
    return stat;
  }).get();

  return Promise.all(rushing_stats);

}

async function getReceiving(receiving_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(receiving_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const receiving_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
    let player = await playerhelper.getPlayer(player_url);

    stat.player = player;

    stat.yards = htmlhelper.getHtml(body, 'td.yds');
    stat.receivingAverage = htmlhelper.getHtml(body, 'td.avg');
    stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    stat.receptions = htmlhelper.getHtml(body, 'td.rec');
    stat.longcatch = htmlhelper.getHtml(body, 'td.long');
    stat.targets = htmlhelper.getHtml(body, 'td.tgts');
    return stat;
  }).get();

  return Promise.all(receiving_stats);
}

async function getFumbles(fumbles_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(fumbles_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const fumble_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      stat.fumbles = htmlhelper.getHtml(body, 'td.fum');
      stat.fumblesLost = htmlhelper.getHtml(body, 'td.lost');
      stat.fumblesRecovered = htmlhelper.getHtml(body, 'td.rec');

    }
    return stat;
  }).get();

  return Promise.all(fumble_stats);

}

async function getDefense(defense_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(defense_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const defense_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      if (player_url) {
        let player = await playerhelper.getPlayer(player_url);
        stat.player = player;
      } else {
        console.log('NO PLAYER');
      }

      

      stat.totalTackles = htmlhelper.getHtml(body, 'td.tot');
      stat.soloTackles = htmlhelper.getHtml(body, 'td.solo');
      stat.sacks = htmlhelper.getHtml(body, 'td.sacks');
      stat.tacklesForLoss = htmlhelper.getHtml(body, 'td.tfl');
      stat.qbHits = htmlhelper.getHtml(body, 'td.hts');
      stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
      stat.passesDefended = htmlhelper.getHtml(body, 'td.pd');

    }
    return stat;
  }).get();

  return Promise.all(defense_stats);

}

async function getInterceptions(interception_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(interception_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const interception_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      stat.interceptions = htmlhelper.getHtml(body, 'td.int');
      stat.yards = htmlhelper.getHtml(body, 'td.yds');
      stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    }
    return stat;
  }).get();

  return Promise.all(interception_stats);

}

async function getKickReturns(kick_returns_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(kick_returns_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const kick_return_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      stat.kickReturns = htmlhelper.getHtml(body, 'td.no');
      stat.yards = htmlhelper.getHtml(body, 'td.yds');
      stat.averageReturn = htmlhelper.getHtml(body, 'td.avg');
      stat.longReturn = htmlhelper.getHtml(body, 'td.long');
      stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    }
    return stat;
  }).get();

  return Promise.all(kick_return_stats);

}

async function getPuntReturns(punt_returns_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(punt_returns_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const punt_return_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      stat.kickReturns = htmlhelper.getHtml(body, 'td.no');
      stat.yards = htmlhelper.getHtml(body, 'td.yds');
      stat.averageReturn = htmlhelper.getHtml(body, 'td.avg');
      stat.longReturn = htmlhelper.getHtml(body, 'td.long');
      stat.touchdowns = htmlhelper.getHtml(body, 'td.td');
    }
    return stat;
  }).get();

  return Promise.all(punt_return_stats);

}

async function getKicking(kicking_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(kicking_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const kicking_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      let fg = htmlhelper.getHtml(body, 'td.fg');
      if (fg) {
        let parts = fg.split('/');
        stat.fieldGoalMade = parts[0];
        stat.fieldGoalAttempts = parts[1];
      } else {
        stat.fieldGoalMade = 0;
        stat.fieldGoalAttempts = 0;
      }

      let xp = htmlhelper.getHtml(body, 'td.xp');

      if (xp) {
        let parts = xp.split('/');
        stat.xpMade = parts[0];
        stat.xpAttempted = parts[1];

      } else {
        stat.xpMade = 0;
        stat.xpAttempted = 0;
      }
      stat.longFieldGoal = htmlhelper.getHtml(body, 'td.long');
      stat.points = htmlhelper.getHtml(body, 'td.pts');
    }
    return stat;
  }).get();

  return Promise.all(kicking_stats);

}

async function getPunting(punting_table) {
  // Get the Table Body
  let table_body = htmlhelper.getHtml(punting_table, 'tbody');
  const $ = cheerio.load(table_body, { xmlMode: true });

  const punting_stats = $('tr:not(.highlight)').map(async function (id, ele) {
    let body = $(this).html();
    let stat = {};

    let player_url_column = htmlhelper.getHtml(body, 'td.name');
    if (player_url_column) {
      let player_url = htmlhelper.getAttributeValue(player_url_column, 'a', 'href');
      let player = await playerhelper.getPlayer(player_url);

      stat.player = player;

      stat.punts = htmlhelper.getHtml(body, 'td.no');
      stat.yards = htmlhelper.getHtml(body, 'td.yds');
      stat.averagePunt = htmlhelper.getHtml(body, 'td.avg');
      stat.insideTwenty = htmlhelper.getHtml(body, 'td.in');
      stat.longPunt = htmlhelper.getHtml(body, 'td.long');
      stat.touchbacks = htmlhelper.getHtml(body, 'td.tb');
    }
    return stat;
  }).get();

  return Promise.all(punting_stats);

}

exports.getGameStats = getGameStats;
exports.getPassing = getPassing;
exports.getDefense = getDefense;
exports.getFumbles = getFumbles;
exports.getInterceptions = getInterceptions;
exports.getKickReturns = getKickReturns;
exports.getKicking = getKicking;
exports.getPuntReturns = getPuntReturns;
exports.getPunting = getPunting;
exports.getReceiving = getReceiving;
exports.getRushing = getRushing;
