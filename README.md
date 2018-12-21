# mongoDB 
###### full document see [MongoDB](https://docs.mongodb.com/manual/reference/mongo-shell/)
#### Command Helpers
- __`help`__	_Show help._
- __`db.help()`__ _Show help for database methods._
- __`db.<collection>.help()`__	_Show help on collection methods. The `<collection>` can be the name of an existing collection or a non-existing collection._
- __`show dbs`__	_Print a list of all databases on the server._
- __`use <db>`__	_Switch current database to `<db>`. The mongo shell variable db is set to the current database._
- __`show collections`__	_Print a list of all collections for current database._
- __`show users`__	_Print a list of users for current database._
- __`show roles`__	_Print a list of all roles, both user-defined and built-in, for the current database._
- __`show profile`__ _Print the five most recent operations that took 1 millisecond or more. See documentation on the database profiler for more information._
- __`show databases`__ _Print a list of all available databases._
#### Basic Shell JavaScript Operations
- __`db.auth()`__	_If running in secure mode, authenticate the user._
- __`coll = db.<collection>`__	_Set a specific collection in the current database to a variable coll, as in the following example: `coll = db.myCollection;` You can perform operations on the myCollection using the variable, as in the following example: `coll.find();`_
- __`db.collection.find()`__ _Find all documents in the collection and returns a cursor._
- __`db.collection.insertOne()`__ _Insert a new document into the collection._
- __`db.collection.insertMany()`__	_Insert multiple new documents into the collection._
- __`db.collection.updateOne()`__	_Update a single existing document in the collection._
- __`db.collection.updateMany()`__	_Update multiple existing documents in the collection._
- __`db.collection.save()`__	_Insert either a new document or update an existing document in the collection._
- __`db.collection.deleteOne()`__	_Delete a single document from the collection._
- __`db.collection.deleteMany()`__	_Delete documents from the collection._
- __`db.collection.drop()`__	_Drops or removes completely the collection._
- __`db.collection.createIndex()`__	_Create a new index on the collection if the index does not exist; otherwise, the operation has no effect._
- __`db.getSiblingDB()`__	_Return a reference to another database using this same connection without explicitly switching the current database. This allows for cross database queries._
- __`db.getCollection("users").find().pretty()`__
- __`db.getCollection("users").find().length()`__
#### Create User
- __`db.createUser()`__
```db.createUser( { user: "accountAdmin01",
                 pwd: "changeMe",
                 customData: { employeeId: 12345 },
                 roles: [ { role: "clusterAdmin", db: "admin" },
                          { role: "readAnyDatabase", db: "admin" },
                          "readWrite"] },
               { w: "majority" , wtimeout: 5000 } )```

# Nginx
- [proxy_read_timeout](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout)
  - __Syntax:__	_proxy_read_timeout time;_
  - __Default:__ `proxy_read_timeout 60s;`
  - __Context:__	http, server, location

# Node
- `export NODE_ENV=production`
- `$ sudo vim /etc/environment`
- Append the following at the end of the file: `NODE_ENV=production`
- Now logout and login again and now we can see the system wide environment variable: `$ printenv | grep NODE_ENV`

# FFmpeg
- [Compiling](https://trac.ffmpeg.org/wiki/CompilationGuide/macOS):
- Once you have compiled all of the codecs/libraries you want, you can now download the FFmpeg source either with Git or the from release tarball links on the website.
- For general instructions on how to compile software, consult the Generic compilation guide. The information there is applicable to the macOS environment as well.
- Run `./configure --help`, and study its output to learn what options are available. Make sure you've enabled all the features you want. Note that `--enable-nonfree` and `--enable-gpl` will be necessary for some of the dependencies above.
- A sample compilation command is:
- `git clone http://source.ffmpeg.org/git/ffmpeg.git ffmpeg`
- `cd ffmpeg`
- ```./configure  --prefix=/usr/local --enable-gpl --enable-nonfree --enable-libass \
--enable-libfdk-aac --enable-libfreetype --enable-libmp3lame \
--enable-libtheora --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 --enable-libopus --enable-libxvid \
--samples=fate-suite/```
- `make`
- After successful compilation, running `sudo make install` will install the ffmpeg binaries with superuser rights. You can also set a prefix during configuration, e.g. `--prefix="$HOME/bin`, where no root rights are needed for `make install`.

# [Compile FFmpeg for Ubuntu, Debian, or Mint](https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu)

# [Full FFMPEG on Linux]()

- ```cd ~/ffmpeg_sources
wget http://downloads.xiph.org/releases/opus/opus-1.0.3.tar.gz
tar xzvf opus-1.0.3.tar.gz
cd opus-1.0.3
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install
make distclean```
- ffmpeg installation: opus not found `PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig"`
- `sudo apt-get install libfdk-aac-dev libass-dev libopus-dev  \
libtheora-dev libvorbis-dev libvpx-dev libssl-dev`
- As of Ubuntu 17.04  `sudo apt-get install nasm` does not supply a new enough nasm so install that manually
- get source for nasm at `http://www.nasm.us/pub/nasm/releasebuilds/?C=M;O=D` download the latest then
- ```cd ~/src/nasm-2.13.02
./configure
make -j8
sudo make install```
- Then for x264 :
- ```git clone git://git.videolan.org/x264.git
cd x264
./configure --enable-static --enable-shared
make -j8
sudo make install```
- For mp3 get LAME (libmp3lame) from http://lame.sourceforge.net/ version v3.100, then give it the normal
- ```cd lame-3.100/
./configure
make -j8
sudo make install```

- ```PKG_CONFIG_PATH="/Users/magic/Documents/nv-codec-headers" ./configure --prefix="$HOME/ffmpeg_build" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --bindir="$HOME/bin" --extra-libs="-ldl" --enable-gpl --enable-libass \
  --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 \
  --enable-libmp3lame --enable-nvenc --enable-nonfree --samples=fate-suite/```

PKG_CONFIG_PATH="/usr/lib/pkgconfig" \
./configure --enable-cuda --enable-cuvid --enable-nvenc --enable-nonfree --enable-libnpp \
--extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib64

PKG_CONFIG_PATH="/usr/lib/pkgconfig" \
./configure --enable-cuda --enable-cuvid --enable-nvenc --enable-nonfree \
--extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib64



## dependence

- [FreeType2](http://www.linuxfromscratch.org/blfs/view/svn/general/freetype2.html)
- [FriBidi](http://www.linuxfromscratch.org/blfs/view/svn/general/fribidi.html)
- [libass](http://www.linuxfromscratch.org/blfs/view/svn/multimedia/libass.html)
- [fdk-aac-0.1.6](http://www.linuxfromscratch.org/blfs/view/cvs/multimedia/fdk-aac.html)[https://downloads.sourceforge.net/opencore-amr/fdk-aac-0.1.6.tar.gz](https://downloads.sourceforge.net/opencore-amr/fdk-aac-0.1.6.tar.gz)
- [Fontconfig-2.12.4](http://www.linuxfromscratch.org/blfs/view/8.1/general/fontconfig.html)
- [Gperf-3.0.4](http://www.linuxfromscratch.org/blfs/view/7.5/general/gperf.html)
- [h265](https://trac.ffmpeg.org/wiki/Encode/H.265)
- [libvpx-1.7.0](http://www.linuxfromscratch.org/blfs/view/8.2/multimedia/libvpx.html)
- []

# [FFmpeg / libav](https://developer.nvidia.com/ffmpeg)
# [Install FFMPEG 2.8.6 support NVENC on Ubuntu 16.04](https://gist.github.com/jniltinho/96bb45bec18a90d0d33448ee67c28cc7)
# [ERROR: cuvid requested, but not all dependencies are satisfied: cuda/ffnvcodec](https://superuser.com/questions/1299064/error-cuvid-requested-but-not-all-dependencies-are-satisfied-cuda-ffnvcodec)

# [tar](https://scottlinux.com/2014/01/07/extracting-or-uncompressing-tar-xz-files-in-linux/)
- `sudo apt-get install xz-utils`
- `tar -xf file.tar.xz`   xz
- `tar xvzf file.tar.gz`  gz

/Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv

ffmpeg -y -threads 6 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -b:v 8000k -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080/out.mpd

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libx264 -preset fast -b:v 8000k -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080/out.mpd

PKG_CONFIG_PATH="/usr/lib/pkgconfig" ./configure --enable-nvenc --enable-nonfree --extra-cflags=-I/usr/local/cuda/include --extra-ldflags=-L/usr/local/cuda/lib

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libx264 -preset fast -b:v 8000k -c:a aac -b:a 128k -t 60 -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080/out.mpd

/*------------x264--------------*/

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libx264 -preset fast -b:v 5000k -c:a aac -b:a 128k -t 60 -vf "scale=-1:720" Chasing.Coral-1080.mp4

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libx264 -preset fast -b:v 5000k -c:a aac -b:a 128k -t 60 -vf "scale=-1:720" Chasing.Coral-720.mp4

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libx264 -preset fast -b:v 2500k -c:a aac -b:a 128k -t 60 -vf "scale=-1:540" Chasing.Coral-540.mp4


/*------------Dash--------------*/



ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.Coral-720.mp4 -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/720/out.mpd

ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.Coral-540.mp4 -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/540/out.mpd

/*------------Hls--------------*/

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -preset fast -b:v 8000k -c:a aac -b:a 128k -t 60 -hls_time 3 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080-hls-vp9/out.m3u8

ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.coral-1080.mp4 -hls_time 3 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080-hls/out.m3u8


ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.coral-720.mp4 -hls_time 3 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/720-hls/out.m3u8

ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.coral-540.mp4 -hls_time 3 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/540-hls/out.m3u8

ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.coral-1080.webm -hls_time 2 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080-hls-vp9/out.m3u8
/*------------Vp9--------------*/

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -speed 1 -b:v 8M -c:a libopus -ac 2 -af "pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR" -b:a 128k -t 30 Chasing.Coral-1080.webm

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -speed 1 -b:v 5M -c:a libopus -ac 2 -af "pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR" -b:a 128k -t 30 -vf "scale=-1:720" Chasing.Coral-720.webm

ffmpeg -y -threads 8 -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -speed 1 -b:v 2.5M -c:a libopus -ac 2 -af "pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR" -b:a 128k -t 30 -vf "scale=-1:540" Chasing.Coral-540.webm

/*------------Vp9 2-pass--------------*/

ffmpeg -y -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -pass 1 -b:v 8M -threads 8 -speed 4 -t 30 \
  -tile-columns 6 -frame-parallel 1 \
  -an -f webm /dev/null


ffmpeg -i /Volumes/Elements/电影/Chasing.Coral.2017.1080p.WEBRip.x264-GH7JKB6\[rarbg\]/chasing.coral.2017.1080p.webrip.x264-gh7jkb6.mkv -c:v libvpx-vp9 -pass 2 -b:v 8M -threads 8 -speed 1 \
  -tile-columns 6 -frame-parallel 1 -auto-alt-ref 1 -lag-in-frames 25 \
  -c:a libopus -b:a 128k -f webm Chasing.Coral-1080.webm


ffmpeg -y -i video-bg.webm -threads 8 -ss 4 -t 15 -c:v libx264 -preset fast -b:v 2000k -vf scale=-1:720 video.mp4

/*------------Gif--------------*/

The standard way to use ffmpeg for GIFs is

Generate a palette from the video

`ffmpeg -y -i file.mp4 -vf palettegen palette.png`
Then,

`ffmpeg -y -i file.mp4 -i palette.png -filter_complex paletteuse -r 10 scale=-1:720 file.gif`
  <!-- ffmpeg -y -i video-bg.webm -i palette.png -filter_complex paletteuse -ss 4 -t 15 -r 10 -s 480x320 file.gif -->