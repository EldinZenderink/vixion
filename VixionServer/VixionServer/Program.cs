using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using SimpleWebSocketServer;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Threading;
using System.Net;
using Newtonsoft.Json.Linq;
using System.Net.Sockets;

namespace VixionServer
{
    class Program
    {
        private static WebSocketServer ws;
        private static HttpServer http;
        private static IMDBFileNameParser parser;
        private static ConcurrentDictionary<string, DataContainer> dicWithFiles;
        private static Thread scanDirs = null;
        private static int currentAmountOfFilesParsed = 0;
        private static int port = 4444;

        static void Main(string[] args)
        {

            Console.WriteLine("Welcome To VixionServer!");
            Console.WriteLine("Please do read the following:");
            Console.WriteLine();
            Console.WriteLine("This server indexes all your files starting from the directory where I am launched. This takes a while!");
            Console.WriteLine("It tries to automatically detect which serie or movie the file belongs to... but be aware that this is never 100% accurate!");
            Console.WriteLine("This is a very early build of the server! Don't be scared by the random text flying by!");
            Console.WriteLine("To open the interface, go to: www.vixion.ga (temporary).");
            Console.WriteLine("If you launch for the first time, this server will show up. Click on it!");
            Console.WriteLine("To be sure that you select the correct server, click on the button that says: " + GetLocalIPAddress());
            Console.WriteLine("Thank you for using Vixion, I hope you enjoy using it :D");

            List<string> DirsInPath = new List<string>();
            if (Directory.GetCurrentDirectory().Contains("/"))
            {
                DirsInPath.AddRange(Directory.GetCurrentDirectory().Split('/'));
            }
            else
            {
                DirsInPath.AddRange(Directory.GetCurrentDirectory().Split('\\'));
            }

            if (File.Exists("exclude.txt"))
            {
                string[] excluded = File.ReadAllLines("exclude.txt");
                List<string> toExclude = new List<string>(excluded);
                parser = new IMDBFileNameParser(DirsInPath[DirsInPath.Count - 1], toExclude);
                Console.WriteLine("If a directory or filename contains one of these values, it will be ignored:");
                foreach (string toBeExcluded in toExclude)
                {
                    Console.WriteLine(toBeExcluded);
                }

            }
            else
            {
                parser = new IMDBFileNameParser(DirsInPath[DirsInPath.Count - 1]);
            }

            http = new HttpServer(port);
            http.SetWebHomeDir(Directory.GetCurrentDirectory() + @"\GUI");
            http.Start();

            ws = new WebSocketServer(4655);
            ws.MessageReceived += new EventHandler<WebSocketEventArgs>(WsMessageReceived);
            ws.DebugMessage += new EventHandler<WebSocketEventArgs>(WsDebugReceived);
            ws.Start();           

            dicWithFiles = new ConcurrentDictionary<string, DataContainer>();
            Console.ReadLine();
        }


        /// <summary>
        /// Gets all the files starting from it's launch directory, if it's a media file, it will look it up on omdb or imdb. A dictionary with found results is being send over
        /// websockets to the interface.
        /// </summary>
        static void UpdateFileDic()
        {

            int amountOfMoviesAndSeriesAlreadyParsed = 0;
            JArray jsonParse = null;
            if (File.Exists("filesparsed.json"))
            {
                Console.WriteLine("Files already parsed! Sending over JSON");
                using (StreamReader file = new StreamReader("filesparsed.json"))
                {

                    string json = file.ReadToEnd();
                    jsonParse = JArray.Parse(json);
                    currentAmountOfFilesParsed = int.Parse(jsonParse[0]["currentAmountOfFiles"].ToString());
                    Console.WriteLine("Already parsed files: " + currentAmountOfFilesParsed);
                    Console.WriteLine("Files already parsed!");
                    ws.SendGlobalMessage("FILES: " + jsonParse[0]["currentAmountOfFiles"]);
                    ws.SendGlobalMessage("DONEPARSING");
                    ws.SendGlobalMessage("FOUND: " + (jsonParse.Count() - 1));
                    amountOfMoviesAndSeriesAlreadyParsed = int.Parse((string)jsonParse[0]["currentAmountOfFiles"]);
                    for (int i = 1; i < jsonParse.Count(); i++)
                    {
                        ws.SendGlobalMessage(jsonParse[i].ToString());
                        ws.SendGlobalMessage("SEND: " + i);
                    }
                    Console.WriteLine("Finished sending data over to client!");
                    ws.SendGlobalMessage("DONESENDING");
                }
            } else
            {
                Console.WriteLine("Did not find previous filesparsed json file!");
            }

            IEnumerable<string> allfiles = GetFiles(Directory.GetCurrentDirectory());
            int totalAmountOfFiles = allfiles.Count() - 1;

            if(totalAmountOfFiles != amountOfMoviesAndSeriesAlreadyParsed)
            {
                if (totalAmountOfFiles != currentAmountOfFilesParsed)
                {
                    Console.WriteLine("Updating File Dictionary!");
                    ws.SendGlobalMessage("FILES: " + totalAmountOfFiles);
                    List<string> files = new List<string>();
                    int i = 0;

                    string imdbId = "";
                    string previousFile = "";
                    JObject data = null;
                    foreach (var file in allfiles)
                    {

                        string filetobeparsed = ((string)file).Replace(Directory.GetCurrentDirectory(), "");
                        if (isMediaFile(filetobeparsed))
                        {
                            ws.SendGlobalMessage("PARSED: " + i);

                            List<string> DirsInPath = new List<string>();
                            if (file.Contains("/"))
                            {
                                DirsInPath.AddRange(file.Split('/'));
                            }
                            else
                            {
                                DirsInPath.AddRange(file.Split('\\'));
                            }

                            if (previousFile != DirsInPath[DirsInPath.Count - 2])
                            {
                                data = parser.GetIMDBData(file);
                                JToken token = data;
                                imdbId = (string)token.SelectToken("imdbID");
                            }


                            string urlToFile = ((string)file).Replace(Directory.GetCurrentDirectory(), "http://" + GetLocalIPAddress() + ":" + port).Replace(@"\", "/");

                            if (imdbId != null && imdbId != "FALSE")
                            {

                                if (dicWithFiles.ContainsKey(imdbId))
                                {

                                    DataContainer info = new DataContainer();
                                    dicWithFiles.TryGetValue(imdbId, out info);
                                    DataContainer oldinfo = info;
                                    if (!info.files.Contains(urlToFile))
                                    {
                                        info.files.Add(urlToFile);
                                    }
                                    dicWithFiles.TryUpdate(imdbId, info, oldinfo);
                                    string json = JsonConvert.SerializeObject(info, Formatting.Indented);
                                }
                                else
                                {
                                    DataContainer info = new DataContainer();
                                    info.files = new List<string>();
                                    info.files.Add(urlToFile);
                                    info.info = data;
                                    dicWithFiles.TryAdd(imdbId, info);
                                }

                            }
                            previousFile = DirsInPath[DirsInPath.Count - 2];
                        }


                        i++;
                    }

                    currentAmountOfFilesParsed = totalAmountOfFiles;
                    ws.SendGlobalMessage("DONEPARSING");

                    ws.SendGlobalMessage("FOUND: " + dicWithFiles.Count());
                    string FullJson = "[{ \"currentAmountOfFiles\" : \"" + currentAmountOfFilesParsed + "\"},";
                    int b = 0;
                    foreach (KeyValuePair<string, DataContainer> pair in dicWithFiles)
                    {
                        string json = JsonConvert.SerializeObject(pair.Value, Formatting.Indented);
                        ws.SendGlobalMessage(json);
                        ws.SendGlobalMessage("SEND: " + b);
                        FullJson = FullJson + json + ",";
                        b++;
                    }
                    FullJson = FullJson.Remove(FullJson.Length - 1) + "]";
                    Console.WriteLine("Finished sending data over to client!");
                    ws.SendGlobalMessage("DONESENDING");
                    using (StreamWriter file = new StreamWriter("filesparsed.json"))
                    {
                        file.WriteLine(FullJson);
                    }

                }
                else if (jsonParse != null)
                {

                    Console.WriteLine("Files already parsed! Sending over JSON");
                    ws.SendGlobalMessage("FILES: " + jsonParse.Count());
                    ws.SendGlobalMessage("DONEPARSING");
                    ws.SendGlobalMessage("FOUND: " + jsonParse.Count());
                    for (int i = 1; i < jsonParse.Count(); i++)
                    {
                        ws.SendGlobalMessage(jsonParse[i].ToString());
                        ws.SendGlobalMessage("SEND: " + i);
                    }
                    Console.WriteLine("Finished sending data over to client!");
                    ws.SendGlobalMessage("DONESENDING");
                }
                else if (jsonParse == null && dicWithFiles.Count() > 0)
                {
                    Console.WriteLine("Files already parsed but no json, creating json file!");
                    string FullJson = "[{ \"currentAmountOfFiles\" : \"" + currentAmountOfFilesParsed + "\"},";
                    ws.SendGlobalMessage("FILES: " + dicWithFiles.Count());
                    ws.SendGlobalMessage("DONEPARSING");
                    ws.SendGlobalMessage("FOUND: " + dicWithFiles.Count());
                    int i = 0;
                    foreach (KeyValuePair<string, DataContainer> pair in dicWithFiles)
                    {
                        string json = JsonConvert.SerializeObject(pair.Value, Formatting.Indented);
                        ws.SendGlobalMessage(json);
                        ws.SendGlobalMessage("SEND: " + i);
                        FullJson = FullJson + json + ",";
                        i++;
                    }
                    FullJson = FullJson.Remove(FullJson.Length - 1) + "]";
                    Console.WriteLine("Finished sending data over to client!");
                    ws.SendGlobalMessage("DONESENDING");
                    using (StreamWriter file = new StreamWriter("filesparsed.json"))
                    {
                        file.WriteLine(FullJson);
                    }
                }

            }          

        }

        /// <summary>
        /// Gets all the files within launch directory and sub directories
        /// </summary>
        private static IEnumerable<string> GetFiles(string path)
        {
            Queue<string> queue = new Queue<string>();
            queue.Enqueue(path);
            while (queue.Count > 0)
            {
                path = queue.Dequeue();
                try
                {
                    foreach (string subDir in Directory.GetDirectories(path))
                    {
                        queue.Enqueue(subDir);
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                }
                string[] files = null;
                try
                {
                    files = Directory.GetFiles(path);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                }
                if (files != null)
                {
                    for (int i = 0; i < files.Length; i++)
                    {
                        yield return files[i];
                    }
                }
            }
        }

        /// <summary>
        /// Gets the local ip address.
        /// </summary>
        static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("Local IP Address Not Found!");
        }

        /// <summary>
        /// Checks if a file is a media file
        /// </summary>
        static bool isMediaFile(string input)
        {
            string fileName = Path.GetFileName(input);
            string[] extensions = { ".aaf", ".3gp", ".asf", ".avchd", ".avi", ".bik", ".dat", ".flv", ".mpeg", ".m4v", ".mkv", ".mp4", ".mts", ".wmv", ".vp9", ".vp8", ".webm", ".iso"};
            bool ismedia = false;

            if (fileName.Length > 1)
            {

                try
                {
                    if (Array.IndexOf(extensions, Path.GetExtension(fileName)) > -1)
                    {
                        ismedia = true;
                    }
                    else
                    {
                        ismedia = false;
                    }
                }
                catch
                {
                    ismedia = false;
                }
            }
            else
            {
                ismedia = false;
            }

            return ismedia;

        }

        static string GetTrailersFromYoutubeData(string input)
        {
            Dictionary<string, string> trailers = new Dictionary<string, string>();

            string[] parts = input.Split(new string[] { "yt-lockup-title" }, StringSplitOptions.None);
            foreach(string part in parts)
            {

                if (part.Contains("href="))
                {
                    string[] subparts = part.Split(new string[] { "href=" }, StringSplitOptions.None);
                    string url = subparts[1].Substring(3).Split('"')[0].Replace('\\', ' ').Replace("watch?v=", "embed/");
                    if (part.Contains("title=") )
                    {
                        subparts = part.Split(new string[] { "title=" }, StringSplitOptions.None);
                        string title = subparts[1].Substring(2).Split('"')[0].Replace('\\', ' '); 
                        if (title.ToLower().Contains("trailer"))
                        {
                            trailers.Add(title, url);
                            break;
                        }
                    }

                }

            }
            string json = JsonConvert.SerializeObject(trailers, Formatting.Indented);
            return json;
        }

        /// <summary>
        /// Event for when data is received over websockets.
        /// </summary>
        static void WsMessageReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            if (msg.Contains("getFiles"))
            {
                try
                {
                    scanDirs.Abort();

                }
                catch
                {

                }
                scanDirs = new Thread(new ThreadStart(UpdateFileDic));
                scanDirs.Start();
                
            } else if (msg.Contains("GetYoutubeTrailer:"))
            {
                string search = msg.Replace("GetYoutubeTrailer:", "").Trim();

                try
                {
                    using (WebClient client = new WebClient())
                    {               
                        Console.WriteLine("Requested trailer for: " + search);        
                        string data = client.DownloadString("https://www.youtube.com/results?search_query=" + search.Replace(' ', '+') + "+trailer&spf=navigate");
                        string json = GetTrailersFromYoutubeData(data);
                        ws.SendGlobalMessage("TRAILERS: " + json);
                    }
                }
                catch
                {
                    ws.SendGlobalMessage("ERROR WHILE PARSING URL");
                }

            }

        }

        /// <summary>
        /// Event for when debug messages from the websocket server are available.
        /// </summary>
        static void WsDebugReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Console.WriteLine(msg);

        }

        /// <summary>
        /// Check if operating system is linux or not (windows has a different file system).
        /// </summary>
        public static bool IsLinux
        {
            get
            {
                int p = (int)Environment.OSVersion.Platform;
                return (p == 4) || (p == 6) || (p == 128);
            }
        }

    }
}
