lyrictagger
===========

Automatically add lyrics to music files

Depends on [eyeD3](http://eyed3.nicfit.net/) for writing lyrics

Installation
------------

First ensure that eyeD3 is installed

- MacOS X

        brew install eyed3

- Other Unix (one of the following)

        [sudo] easy_install eyed3
        [sudo] pip install eyed3
        [sudo] apt-get install eyed3

Then install `lyrictagger`

    npm install -g lyrictagger

Example
-------

Run with a music file as the first argument to gather and write lyrics to
the file (lyrics snipped for brevity).

    $ lyrictagger ~/Downloads/01\ Specular\ Reflection.mp3
    processing: 01 Specular Reflection.mp3
    [Music & lyrics by Between The Buried And Me]
    [Prospect #1]

    A twisted crash... vibrations forming my personal currency.
    A lifeline... a sweatbox, the linear mind as one.
    Who would have thought?
    ... SNIPPED ...

    write these lyrics to /Users/dave/Downloads/01 Specular Reflection.mp3?
    [y/N]: y

    01 Specular Reflection.mp3  [ 23.69 MB ]
    -------------------------------------------------------------------------------
    Time: 11:21 MPEG1, Layer III    [ ~290 kb/s @ 44100 Hz - Joint stereo ]
    -------------------------------------------------------------------------------
    ID3 v2.4:
    title: Specular Reflection      artist: Between the Buried and Me
    album: The Parallax: Hypersleep Dialogues       year: 2011
    track: 1
    Lyrics: [Description: ] [Lang: eng]
    [Music & lyrics by Between The Buried And Me]
    [Prospect #1]

    A twisted crash... vibrations forming my personal currency.
    A lifeline... a sweatbox, the linear mind as one.
    Who would have thought?
    ... SNIPPED ...

    Setting lyrics: []: [Music & lyrics by Between The Buried And Me]
    [Prospect #1]

    A twisted crash... vibrations forming my personal currency.
    A lifeline... a sweatbox, the linear mind as one.
    Who would have thought?
    ... SNIPPED ...

    Writing tag...

    eyeD3_script exited with code 0

First, `lyrictagger` gathers and prints the lyrics it finds for the song, and
then asks you if you'd like to write the lyrics to the file (supply `--yes` or `-y`
to assume yes).

Then, assuming you say yes, it forks off `eyed3` to write the lyrics to the file,
and prints the exit code of eyed3.

Usage
-----

You can run with `--tags` to view the metadata of a file.

    $ lyrictagger --tags ~/Downloads/01\ Specular\ Reflection.mp3
    processing: 01 Specular Reflection.mp3
    { title: 'Specular Reflection',
      artist: [ 'Between the Buried and Me' ],
      albumartist: [],
      album: 'The Parallax: Hypersleep Dialogues',
      year: '2011',
      track: { no: 1, of: 0 },
      genre: [],
      disk: { no: 0, of: 0 },
      picture:
       [ { format: 'jpg',
           data: <Buffer ff d8 ff e0 00 10 ...> } ],
      filename: '/Users/dave/Downloads/01 Specular Reflection.mp3' }

Run with `--out` to just print the lyrics.

    $ lyrictagger --out ~/Downloads/01\ Specular\ Reflection.mp3
    processing: 01 Specular Reflection.mp3
    [Music & lyrics by Between The Buried And Me]
    [Prospect #1]

    A twisted crash... vibrations forming my personal currency.
    A lifeline... a sweatbox, the linear mind as one.
    Who would have thought?
    ... SNIPPED ...


Credits
-------

* Tags gathered with [musicmetadata](https://github.com/leetreveil/node-musicmetadata)
* Modeled after on [tvnamer](https://github.com/dbr/tvnamer)
* Lyrics gathered with [metalminer](https://github.com/sjaak666/metalminer)
* Lyrics written with [eyeD3](http://eyed3.nicfit.net/)

License
-------

MIT License
