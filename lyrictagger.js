#!/usr/bin/env node
/**
 * Lyric Tagger
 *
 * Automatically add lyrics to music files
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 4/12/2013
 * License: MIT
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');
var ent = require('ent');
var exec = require('exec');
var getopt = require('posix-getopt');
var metalminer = require('metalminer');
var musicmetadata = require('musicmetadata');
var unidecode = require('unidecode');

var package = require('./package.json');

var possible = ['eyeD3', 'eyeD3_script'];
var command; // the eyed3 command found
var rl; // readline if applicable

require('colors');

/**
 * Usage
 *
 * return the usage message
 */
function usage() {
  return util.format([
    'Usage: %s file1.mp3 file2.mp3 file3.mp3 ...',
    '',
    'Gather lyrics for given music files',
    '',
    '-h, --help       print this message and exit',
    '-o, --out        just output the lyrics, don\'t write any tags',
    '-t, --tags       just print the tags from the files processesd',
    '-u, --updates    check for available updates',
    '-v, --version    print the version number and exit',
    '-y, --yes        assume yes (batch mode)',
  ].join('\n'), path.basename(process.argv[1]));
}

/**
 * Check tags
 *
 * Check a given set of metadata to make sure all tags are present
 */
function checktags(meta) {
  return meta.album && meta.title && meta.artist.length;
}

/**
 * find eyed3
 */
function findeyed3(cb) {
  var i = -1;
  function ecb(err, out, code) {
    if (code === 0) return cb(possible[i]);
    var cmd = possible[++i];
    if (!cmd) return cb(undefined);
    exec([possible[++i], '-h'], ecb);
  }
  ecb();
}

// command line arguments
var options = [
  'h(help)',
  'o(out)',
  't(tags)',
  'u(updates)',
  'v(version)',
  'y(yes)',
].join('');
var parser = new getopt.BasicParser(options, process.argv);

var out = false;
var tagsonly = false;
var yes = false;
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'h': console.log(usage()); process.exit(0);
    case 'o': out = true; break;
    case 't': tagsonly = true; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0);
    case 'y': yes = true; break;
    default: console.error(usage()); process.exit(1);
  }
}
var files = process.argv.slice(parser.optind());

// make a queue
var q = async.queue(processfile, 1);

// on exit
q.drain = function() {
  if (rl) {
    rl.close();
    process.stdin.destroy();
  }
};

// find eyed3 maybe
if (out || tagsonly) {
  // don't load readline or find eyed3
  loadqueue();
} else {
  if (!yes) rl = require('readline').createInterface(process.stdin, process.stdout);
  findeyed3(function(cmd) {
    if (!cmd) {
      console.error([
        'eyeD3 not found!'.red,
        '',
        'try the following commands to install eyeD3',
        '',
        'MacOS X',
        '  brew install eyed3',
        '',
        'Other Unix (one of the following)',
        '  [sudo] easy_install eyed3',
        '  [sudo] pip install eyed3',
        '  [sudo] apt-get install eyed3',
      ].join('\n'));
      process.exit(1);
    }
    command = cmd;
    loadqueue();
  });
}

// loop the hosts and go!
function loadqueue() {
  files.forEach(function(file) {
    q.push(file, function() {});
  });
}

// process each file
function processfile(file, cb) {
  var parser = new musicmetadata(fs.createReadStream(file));
  parser.on('metadata', function(meta) {
    meta.filename = file;

    console.log('processing: %s'.cyan, path.basename(file).green);

    // Only print the tags if --tags is supplied
    if (tagsonly) {
      console.log(util.inspect(meta, false, null, true));
      return cb();
    }

    // Check that all tags are present
    if (!checktags(meta)) {
      console.error('%s: error reading tags/not all tags present'.red, file.green);
      console.log(util.inspect(meta, false, null, true));
      return cb();
    }

    var info = {
      title: meta.title,
      artist: meta.artist[0],
      album: meta.album
    };

    // get the lyrics from the remote sourc
    metalminer.getLyrics(info, function(err, data) {
      if (err) {
        console.error(err);
        return cb();
      }

      data = encode(data);
      // print out the lyrics found
      console.log(data);

      // if they just want the output we're done
      if (out) return cb();

      // don't ask
      if (yes) return go();

      // hack for rl length
      console.log('\nwrite these lyrics to '.cyan + file.green + '?'.cyan)
      rl.question('[y/N]: ', function(ans) {
        if (ans !== 'y') {
          console.log('lyrics not written');
          return cb();
        }
        go();
      });

      function go() {
        writelyrics(file, data, function(err, out, code) {
          if (out) console.log(out);
          if (err) console.log(err.red);
          console.log('%s exited with code %s\n',
              command.cyan,
              code ? (''+code).red : (''+code).green);
          cb();
        });
      }
    });
  });
}

// write lyrics to a music file with eyed3
function writelyrics(file, lyrics, cb) {
  var c = [command, '--lyrics=eng::' + lyrics, file];
  exec(c, cb);
}

// encode text for lyrics
function encode(s) {
  // super hacky html
  return unidecode(ent.decode(s
    .replace(/<br><br>/g, '\n') // turn multiple <br> into newline
    .replace(/<[^>]+>/g, '') // strip out html
  ) .replace(/\r/g, '') ) // get rid of carriage returns
    .toString('utf-8'); // utf-8 for safety
}
