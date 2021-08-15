const client = require('axios');
const htmlhelper = require('./htmlhelper.js');
const cheerio = require('cheerio');

async function getTeamStats(matchup_url) {
  const { data } = await client.get(matchup_url);


  let teamstat = {};
  let section = htmlhelper.getHtml(data, '#teamstats-wrap');
  teamstat.firstDowns = getTeamStat(section, 'tr[data-stat-attr="firstDowns"]')
  teamstat.passingFirstDowns = getTeamStat(section, 'tr[data-stat-attr="firstDownsPassing"]');
  teamstat.rushingFirstDowns = getTeamStat(section, 'tr[data-stat-attr="firstDownsRushing"]');
  teamstat.penaltyFirstDowns = getTeamStat(section, 'tr[data-stat-attr="firstDownsPenalty"]');
  teamstat.thirdDownEfficiency = getTeamStat(section, 'tr[data-stat-attr="thirdDownEff"]');
  teamstat.fourthDownEfficiency = getTeamStat(section, 'tr[data-stat-attr="fourthDownEff"]');
  teamstat.defesnsivePlays = getTeamStat(section, 'tr[data-stat-attr="totalOffensivePlays"]');
  teamstat.totalYards = getTeamStat(section, 'tr[data-stat-attr="totalYards"]');
  teamstat.totalDrives = getTeamStat(section, 'tr[data-stat-attr="totalDrives"]');
  teamstat.yardsPerPlay = getTeamStat(section, 'tr[data-stat-attr="yardsPerPlay"]');
  teamstat.totalPassingYards = getTeamStat(section, 'tr[data-stat-attr="netPassingYards"]');
  teamstat.passingEfficiency = getTeamStat(section, 'tr[data-stat-attr="completionAttempts"]');
  teamstat.yardsPerPass = getTeamStat(section, 'tr[data-stat-attr="yardsPerPass"]');
  teamstat.interceptionsThrown = getTeamStat(section, 'tr[data-stat-attr="interceptions"]');
  teamstat.sacks = getTeamStat(section, 'tr[data-stat-attr="sacksYardsLost"]');
  teamstat.rushingYards = getTeamStat(section, 'tr[data-stat-attr="rushingYards"]');
  teamstat.rushingAttempts = getTeamStat(section, 'tr[data-stat-attr="rushingAttempts"]');
  teamstat.yardsPerRush = getTeamStat(section, 'tr[data-stat-attr="yardsPerRushAttempt"]');
  teamstat.redZoneEfficiency = getTeamStat(section, 'tr[data-stat-attr="redZoneAttempts"]');
  teamstat.penalties = getTeamStat(section, 'tr[data-stat-attr="totalPenaltiesYards"]');
  teamstat.turnovers = getTeamStat(section, 'tr[data-stat-attr="turnovers"]');
  teamstat.fumbles = getTeamStat(section, 'tr[data-stat-attr="fumblesLost"]');
  teamstat.intereceptions = getTeamStat(section, 'tr[data-stat-attr="interceptions"]');
  teamstat.defensiveTouchdowns = getTeamStat(section, 'tr[data-stat-attr="defensiveTouchdowns"]');
  teamstat.possesionTime = getTeamStat(section, 'tr[data-stat-attr="possessionTime"]');
  teamstat.boxscore = getBoxScore(data);

  return teamstat;
}

function getTeamStat(section, valueSelector) {

  let row = htmlhelper.getHtml(section, valueSelector);

  let stat = {};
  stat.home = htmlhelper.getValue(row, 'td', 1).replace('\t', '').replace('\n', '');
  stat.away = htmlhelper.getValue(row, 'td', 2).replace('\t', '').replace('\n', '');
  return stat;
}

function getBoxScore(page_data) {
  let table = htmlhelper.getHtml(page_data, '#linescore');
  let table_body = htmlhelper.getHtml(table, 'tbody');
  const $ = cheerio.load(table_body, {xmlMode: true});

  let scores = [];
  $('tr').each(function (id, ele) {
    let boxscore = {};
    let body  = $(this).html();

    const col = cheerio.load(body, {xmlMode: true});
    let count = 1;
    boxscore.team = htmlhelper.getValue(body, 'td', 0);
    let quarters = [];
    col('td').each(function(id, ele) {
      let score = {};
      let body = col(this).html();
      
      if (!col(this).hasClass('final-score')) {
        score.quarter = count;
        score.points = body;
      } else {
        boxscore.final = body;
      }
      quarters.push(score);
      count++;
    });
    boxscore.quarters = quarters;
    scores.push(boxscore);
  });
  return scores; 
}


exports.getTeamStats = getTeamStats;
exports.getBoxScore = getBoxScore;
