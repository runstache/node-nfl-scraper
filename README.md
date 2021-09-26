# NFL Stats Scraper
NodeJS Stat Scraper for NFL Statistics

## Executing

The scraper takes the following command line arguments:

* Week Number - NFL Week Number
* Year - Season Year
* Season Type - Used to define which season: (1 - Preseaon, 2 - Regular, 3 - Postseason)
* Schedule Only - Specifies to only pull the schedule entries and ignore pulling game stats.  (0 - for stats, 1 - for no stats)

The following command is used to execute the scraper:

```bash
node index.js 1 2021 2 0
```

## Bulk Execution

To pull multiple weeks, you can leverage the __pull_data.sh__ script.  Update the values for year, week and season type to execute for multiple weeks.  When running multiple weeks, be aware of errors that show up and would then require you to run a given week over.

