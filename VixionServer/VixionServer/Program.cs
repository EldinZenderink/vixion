using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
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
            Console.WriteLine("To open the interface, go to: www.vixion.16mb.com (temporary).");
            Console.WriteLine("If you launch for the first time, this server will show up. Click on it!");
            Console.WriteLine("To be sure that you select the correct server, click on the button that says: " + GetLocalIPAddress());
            Console.WriteLine("Thank you for using Vixion, I hope you enjoy using it :D");

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

        static void UpdateFileDic()
        {
            Console.Clear();

            int totalAmountOfFiles = 0;
            IEnumerable<string> allfiles = GetFiles(Directory.GetCurrentDirectory());

            totalAmountOfFiles = allfiles.Count();

            if(totalAmountOfFiles != currentAmountOfFilesParsed)
            {

                List<string> files = new List<string>();
                Console.WriteLine("Ammount of files: " + totalAmountOfFiles);
                double procent = totalAmountOfFiles / 100;
                int i = 0;
                foreach (var file in allfiles)
                {
                    string filetobeparsed = ((string)file).Replace(Directory.GetCurrentDirectory(), "");
                    double progress = i / procent;
                    if (isMediaFile(filetobeparsed))
                    {
                        string fileName = Path.GetFileNameWithoutExtension(filetobeparsed);

                        string parsed = parseFileName(fileName).Trim();
                        Console.WriteLine(parsed);
                        if (parsed.Length > 0)
                        {
                            string urlToFile = ((string)file).Replace(Directory.GetCurrentDirectory(), "http://" + GetLocalIPAddress() + ":" + port).Replace(@"\", "/");

                            if (dicWithFiles.ContainsKey(parsed))
                            {

                                Console.WriteLine("Dictionairy already contains :" + parsed);
                                DataContainer info = new DataContainer();
                                dicWithFiles.TryGetValue(parsed, out info);
                                DataContainer oldinfo = info;
                                if (!info.files.Contains(urlToFile))
                                {
                                    info.files.Add(urlToFile);
                                }
                                dicWithFiles.TryUpdate(parsed, info, oldinfo);
                                string json = JsonConvert.SerializeObject(info, Formatting.Indented);
                            }
                            else
                            {
                                Console.WriteLine("Dictionairy does not contain :" + parsed);
                                DataContainer info = new DataContainer();
                                info.files = new List<string>();
                                info.files.Add(urlToFile);

                                try
                                {

                                    WebClient client = new WebClient();
                                    string reply = client.DownloadString("http://www.omdbapi.com/?t=" + parsed.Replace(' ', '+'));

                                    if (reply.Contains("not found"))
                                    {
                                        string id = GetIMDBID(parsed);
                                        Console.WriteLine("Couldn't find through omdb, had to scrap imdb for id and redo omdb data parse: " + id);
                                        if (id != "Still not found")
                                        {
                                            reply = client.DownloadString("http://www.omdbapi.com/?i=" + id);
                                            info.info = JObject.Parse(reply);

                                            if (((string)info.info["Poster"]).Contains("http://ia.media-imdb.com/images/M/"))
                                            {
                                                ((string)info.info["Poster"]).Replace("http://ia.media-imdb.com/images/M/", "https://images-na.ssl-images-amazon.com/images/M/");
                                            }

                                        }
                                        else
                                        {
                                            info.info = JObject.Parse("{\"Response\": \"False\", \"Error\": \"Movie or Serie not found :(\", \"ParsedTitle\": \"" + parsed + "\"}");
                                        }

                                    }
                                    else
                                    {

                                        info.info = JObject.Parse(reply);
                                        if (((string)info.info["Poster"]).Contains("http://ia.media-imdb.com/images/M/"))
                                        {
                                            ((string)info.info["Poster"]).Replace("http://ia.media-imdb.com/images/M/", "https://images-na.ssl-images-amazon.com/images/M/");
                                        }
                                    }
                                }
                                catch
                                {
                                    info.info = JObject.Parse("{\"Response\": \"False\", \"Error\": \"Movie or Serie not found :(\", \"ParsedTitle\": \"" + parsed + "\"}");
                                }
                                dicWithFiles.TryAdd(parsed, info);
                            }

                        }
                    }

                    i++;
                }

                currentAmountOfFilesParsed = totalAmountOfFiles;
            }


            foreach (KeyValuePair<string, DataContainer> pair in dicWithFiles)
            {
                string json = JsonConvert.SerializeObject(pair.Value, Formatting.Indented);
                ws.SendGlobalMessage(json);
            }
            ws.SendGlobalMessage("DONE");

        }

        static string GetIMDBID(string search)
        {
            WebClient client = new WebClient();

            try
            {
                string reply = client.DownloadString("https://v2.sg.media-imdb.com/suggests/i/" + search.Replace(' ', '_') + ".json");
                if (reply.Contains("("))
                {
                    string roughJson = reply.Split('(')[1];
                    string json = roughJson.Substring(0, roughJson.Length - 1);
                    Console.WriteLine(json);
                    JObject o = JObject.Parse(json);
                    string actualId = o["d"][0]["id"].ToString();
                    return actualId;
                }
                else
                {
                    return "Still not found";
                }
            }
            catch (Exception e)
            {
                return "Still not found - Error: " + e.ToString();
            }
        }

        public static string Reverse(string s)
        {
            char[] charArray = s.ToCharArray();
            Array.Reverse(charArray);
            return new string(charArray);
        }

        private static string parseFileName(string input)
        {
            string output = input;

            try
            {
                string temp = output;
                temp = temp.Split('[')[0];
                output = temp + input.Split(']')[1];

            }
            catch
            {

            }

            try
            {
                string temp = output;
                temp = temp.Split(new string[] { "S0" }, StringSplitOptions.None)[0];
                output = temp;

            }
            catch
            {

            }

            try
            {
                string temp = output;
                temp = temp.Split(new string[] { "S1" }, StringSplitOptions.None)[0];
                output = temp;

            }
            catch
            {

            }

            try
            {
                string temp = output;
                temp = temp.Split(new string[] { "S2" }, StringSplitOptions.None)[0];
                output = temp;

            }
            catch
            {

            }

            try
            {
                string temp = output;
                temp = temp.Split(new string[] { "S3" }, StringSplitOptions.None)[0];
                output = temp;

            }
            catch
            {

            }

            try
            {
                string temp = output;
                temp = temp.Split('(')[0];
                output = temp + input.Split(')')[1];

            }
            catch
            {

            }

            try
            {
                string temp = output;
                output = temp.Split(new Char[] { '0', '1', '3', '4', '5', '7', '8', '9' })[0];

            }
            catch
            {

            }

            output = output.Trim();


            StringBuilder sb = new StringBuilder();
            foreach (char c in output)
            {
                if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '_' || c == ' ' || c == '.' )
                {
                    sb.Append(c);
                }
            }
            output = sb.ToString().Replace(' ', '_').Replace('.', ' ');

             
            return output;
        }

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


        static bool isMediaFile(string input)
        {
            string fileName = Path.GetFileName(input);
            string[] extensions = { ".aaf", ".3gp", ".asf", ".avchd", ".avi", ".bik", ".dat", ".flv", ".mpeg", ".m4v", ".mkv", ".mp4", ".mts", ".wmv", ".vp9", ".vp8", ".webm" };
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
                
            }

        }
        static void WsDebugReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Console.WriteLine(msg);

        }

    }
}
