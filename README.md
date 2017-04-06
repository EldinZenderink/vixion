# Vixion


Vixion is a media indexation software. It indexes all your video files depending on where you put the server, and present them within a web based interface together with information about the tv show or movie. The webbased interface provides a direct link to the file, streamed over http. 

  - Indexes and catagorizes every video file.
  - Presents every tv show and movie found with to the point information.**
  - On Android play the movie directly from the interface.
  - On Desktop you will get a link to the file within your clipboard.***
  - Magic.

** Parsed from IMDB
*** (Due to desktop browsers having a safety regulation preventing opening third party media players, the link to the file will be copied to your clipboard when you press on the file link)

# Screenshots - Desktop/Tablet
![home page](https://i.imgur.com/7MgpDO1.png)

![information page(zoomed out)](https://i.imgur.com/Xa3Q6Ma.png)

# Screenshots - Mobile

![home page](https://i.imgur.com/cosVdIj.png)

![information page](https://i.imgur.com/Gz56lol.png)

# Video Tutorial Installation & Usage

[Installation On Windows (10)](https://www.youtube.com/watch?v=jVJ5YrxVZBM&feature=youtu.be)
[Installation On Linux(Debian)](https://www.youtube.com/watch?v=vys3SYVEC3M&feature=youtu.be)

# New Features sinds previous release!
 *Server:*

 - Fully reworked file parsing through IMDB/OMDB (it detects quit a bit more and correct than the previous release).
 - Added support for excluding certain filenames (or directories).
 - Now saves all the parsed files locally as json, meaning the next time you load the interface, it doesn't have to parse all the files again.
 - Improved stability.

 *Interface:*
 - Added progressbar for showing the parsing progress.
 - Make back/previous screen/page work.
 - Added default poster for posters images which didn't load.
 - Improved server detection.
 - Added support for App modus within android (With chrome: go to settings -> add to home screen)
 - Added a quick and dirty logo.


### Tech

Vixion uses a number of open source projects to work properly:

* [MaterializeCSS](http://materializecss.com) - Slick looking css framework!
* [jQuery] - duh
* [OMDb API](http://omdbapi.com/) - Don't know what to do without it.
* [IMDB](http://imdb.com) - The original source (used in case the initial search through omdb turns out empty).

And of course Vixion itself is open source with a [public repository][dill] on GitHub.

### Installation - Linux

VixionServer is a C# based application. This requires Mono to be installed. Read [here](http://www.mono-project.com/docs/getting-started/install/linux/) on how to do that.

- Make sure you have SSH access or direct access to your Linux machine and Terminal.
- Place "VixionServer.exe" within the directory where your video files are located (it scans it in tree form, starting from the location where the server is put).

To keep the running when you use SSH and want to close the session: [read here](http://www.tecmint.com/keep-remote-ssh-sessions-running-after-disconnection/). To be sure that the server keeps running, I suggest to use a keyboard and mouse directly on your linux machine, instead of remotely. 
- In the terminal: cd to the directory where "VixionServer.exe" is located.
- Type this command (make sure you have admin rights): "sudo mono VixionServer.exe".
- Keep terminal open if your local, or repeat the same steps for keeping remote ssh sessions running after disconnect.

**Done.**

### Installation - Windows

- Put "VixionServer.exe" into a directory where your video files are located  (it scans it in tree form, starting from the location where the server is put).
- Run the application. 

**Done.**

### Usage

The most important part, you are done installing the damn thing... now what?

It's easy :D :
- Open your browser(prefferably Chrome).
- Go to [http://vixion.ga](http://vixion.ga).
- Follow the on screen steps.
- Be patient and let the server do its job^^.
- Have fun :D.

If you want to exclude certain filenames or directories(their name) from being parsed through IMDB/OMDB, do the following:

- Go to the directory where VixionServer.exe resides
- Create a file called "exclude.txt"
- Add everything that should be excluded on a new line.
- Save the file
- If there is a file called "filesparsed.json" present, remove it.
- Restart VixionServer

**Done.**


### Development

I have to be honest here, this whole application started out not to seriously, as I had some issues thinking of ways around providing direct access to the files etc. Hence I did not put enough effort into making the code readable or manageable. I did tho make sure that the basic functionality is working.

My first priority lies with making the code readable, manageable and maintainable. Afterwards, things like improved data scraping / imdb searching will be prioritorized.** Only then I will start thinking of improving the interface, making it more managable, adding search capabilities, etc. 

Unfortunately, or fortunately for me, I must say, I am at the brink of starting my internship assignment. This means that it will be consuming my time quit a bit, meaning development on this application might be on hold for a while. Hence I don't mind if someone else goes along and improves this thing by himself (I would be glad even). 

**Scraping is still kinda bad, it works for most file names, but some are just to difficult to parse (like inverted names, names with alot of numbers etc, in the future I hope to improve upon this)

### Known issues.
Much like everything, this is the first release of Vixion, and with every release comes problems! I did not have the time or experience to test this application, so I might not list all of the issues. 

**THE CODE IS HORRIBLE :X**

- Sometimes when multiple files for a Tv Show are found, not all of them end up being parsed.
- Sometimes incorrect data is shown for a movie or tv show, depending on it's name.
- Cover/Posters for a Tv Show or Movie didn't load, but information is available.


### Todos

 - Make code readable, manageable and maintainable.
 - Improve information scraping from IMDB.
 - Add Search functionality to the interface.
 - Make a local server for desktop use, that allows videos to be opened in the default media player directly (UGH).

License
----

MIT


**Free Software, Hell Yeah!**
