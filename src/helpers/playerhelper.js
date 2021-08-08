const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./htmlhelper.js');


async function getPlayer(url) {
  //Replace the Player Bio

  bio_url = url.replace('player/', 'player/bio/');

  // Go get the data
  const { data } = await client.get(bio_url);


  // Populate the Player
  player = {};

  player.url = url;

  let name_section = htmlhelper.getHtml(data, 'h1.PlayerHeader__Name')

  const name = cheerio.load(name_section, {xmlMode: true});

  var name_value = '';

  name('span').each(function(id, ele) {
    let body = name(this).html();
    name_value = name_value + ' ' + body;
  });

  player.name = name_value.trim();
  player.bio = [];

  const $ = cheerio.load(data, { xmlMode: true });

  bios = [];
  $('div.Bio__Item').each(function (id, ele) {
    let body = $(this).html();
    let bio = {};
    bio.key = htmlhelper.getHtml(body, 'span.Bio__Label').trim();
    bio.value = htmlhelper.getHtml(body, 'span.flex-uniform').trim();

    if (bio.key == 'Position' || bio.key == 'DOB') {
      bios.push(bio);
    }
  });
  player.bio = bios;
  return player;
}

exports.getPlayer = getPlayer;