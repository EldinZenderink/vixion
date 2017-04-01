using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;

namespace VixionServer
{
    class ThreadInfo
    {
        public string filename { get; set; }
    }

    class IMDBFileNameParser
    {

        private List<string> TheseShouldNotBeParsed = null;
        private string startDir = "";
        public IMDBFileNameParser()
        {
            TheseShouldNotBeParsed = new List<string>();
        }
        public IMDBFileNameParser(string startDir)
        {
            TheseShouldNotBeParsed = new List<string>();
            this.startDir = startDir;
        }

        public IMDBFileNameParser(string startDir, List<string> TheseShouldNotBeParsed)
        {
            this.TheseShouldNotBeParsed = TheseShouldNotBeParsed;
            this.startDir = startDir;
        }

        public JObject GetIMDBData(string filename)
        {
            return GetAllPossibleNames(filename);
        }

        private JObject GetAllPossibleNames(string input)
        {
            Console.WriteLine("Starting to parse from IMDB: " + input);

            List<string> AllPossibleNames = new List<string>();

            List<string> DirsInPath = new List<string>();
            if (input.Contains("/"))
            {
                DirsInPath.AddRange(input.Split('/'));
            }
            else
            {
                DirsInPath.AddRange(input.Split('\\'));
            }

            if (DirsInPath.Count > 3 && !ExcludeNames(DirsInPath[DirsInPath.Count - 3]) && !ExcludeNames(DirsInPath[DirsInPath.Count - 2]))
            {
                AllPossibleNames.Add(DirsInPath[DirsInPath.Count - 3]);
                AllPossibleNames.Add(DirsInPath[DirsInPath.Count - 2]);
            }
            else if (DirsInPath.Count > 2 && !ExcludeNames(DirsInPath[DirsInPath.Count - 2]))
            {
                AllPossibleNames.Add(DirsInPath[DirsInPath.Count - 2]);
            }


            AllPossibleNames.Add(DirsInPath[DirsInPath.Count - 1]);

            foreach (string name in AllPossibleNames)
            {
                string[] parsed = GetAllParsedNames(name);
                string year = parsed[0];

                foreach (string parsedFileName in parsed)
                {

                    if (parsedFileName != year && !ExcludeNames(parsedFileName))
                    {
                        try
                        {

                            using (WebClient myWebClient = new WebClient())
                            {
                                string download = myWebClient.DownloadString("http://www.omdbapi.com/?t=" + parsedFileName.Trim() + "&y=" + year.Trim());

                                if (!download.Contains("Error"))
                                {
                                    JObject data = JObject.Parse(download);
                                    return JObject.Parse(download);
                                }
                            }
                        } catch(WebException e)
                        {
                            Console.WriteLine("ERROR ON DOWNLOADING JSON with URL: " + "http://www.omdbapi.com/?t=" + parsedFileName.Trim() + "&y=" + year.Trim());
                            Console.WriteLine(e.ToString());
                        }


                    }
                }

                foreach (string parsedFileName in parsed)
                {
                    if (parsedFileName != year && !ExcludeNames(parsedFileName))
                    {
                        
                        try
                        {
                            using (WebClient myWebClient = new WebClient())
                            {
                                string download = myWebClient.DownloadString("https://v2.sg.media-imdb.com/suggests/" + parsedFileName.ToLower()[0] + "/" + parsedFileName.ToLower().Trim().Replace(' ', '_') + ".json");

                                if (download.Contains("\"d\":"))
                                {
                                    download = download.Split('(')[1].Split(')')[0];
                                    try
                                    {
                                        dynamic results = JsonConvert.DeserializeObject<dynamic>(download);
                                        string ImdbID = (string)results.d[0].id;

                                        try
                                        {
                                            using (WebClient myWebClient2 = new WebClient())
                                            {
                                                download = myWebClient2.DownloadString("http://www.omdbapi.com/?i=" + ImdbID);

                                                if (!download.Contains("Error"))
                                                {
                                                    JObject data = JObject.Parse(download);
                                                    return JObject.Parse(download);
                                                }
                                            }
                                        }
                                        catch (WebException e)
                                        {
                                            Console.WriteLine("ERROR ON DOWNLOADING JSON with URL: " + "http://www.omdbapi.com/?i=" + ImdbID);
                                            Console.WriteLine(e.ToString());
                                        }

                                    } catch (JsonException jE)
                                    {
                                        Console.WriteLine("Wtf imdb? Why u do this:" + jE.ToString());
                                    }


                                }

                            }
                                
                        }
                        catch (WebException e)
                        {
                            Console.WriteLine("ERROR ON DOWNLOADING JSON with URL: " + "https://v2.sg.media-imdb.com/suggests/g/" + parsedFileName.Trim().Replace(' ', '_') + ".json");
                            Console.WriteLine(e.ToString());
                        }
                    }
                }
            }

            return JObject.Parse("{\"Error\" : \"Did not find anything\", \"files\" : \"" + Path.GetFileName(input) + "\", \"imdbID\" : \"FALSE\"}");
        }

        private string[] GetAllParsedNames(string input)
        {
            string year = "";
            List<string> PossibleNames = new List<string>();

            if (input.Contains('['))
            {
                if (input.Contains(']'))
                {
                    input = input.Split('[')[0] + input.Split(']')[1];
                }
            }

            if (input.Contains('('))
            {
                if (input.Contains(')'))
                {
                    input = input.Split('(')[0] + input.Split(')')[1];
                }
            }

            if (input.Contains("S0"))
            {
                try
                {
                    input = input.Split(new string[] { "S0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "S0" }, StringSplitOptions.None)[1].Substring(2);

                } catch
                {
                    try
                    {
                        input = input.Split(new string[] { "S0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "S0" }, StringSplitOptions.None)[1].Substring(1);

                    }
                    catch
                    {
                        input = input.Split(new string[] { "S0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "S0" }, StringSplitOptions.None)[1];
                    }
                } 
            }

            if (input.Contains("E0"))
            {
                try
                {

                    input = input.Split(new string[] { "E0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "E0" }, StringSplitOptions.None)[1].Substring(2);
                } catch
                {
                    try
                    {

                        input = input.Split(new string[] { "E0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "E0" }, StringSplitOptions.None)[1].Substring(1);
                    }
                    catch
                    {
                        input = input.Split(new string[] { "E0" }, StringSplitOptions.None)[0] + input.Split(new string[] { "E0" }, StringSplitOptions.None)[1];
                    }
                }
            }

            if (input.Contains("1080"))
            {
                input = input.Split(new string[] { "1080" }, StringSplitOptions.None)[0] + input.Split(new string[] { "1080" }, StringSplitOptions.None)[1];
            }

            if (input.Contains("720"))
            {
                input = input.Split(new string[] { "720" }, StringSplitOptions.None)[0] + input.Split(new string[] { "720" }, StringSplitOptions.None)[1];
            }

            if (input.Contains("3D"))
            {
                input = input.Split(new string[] { "3D" }, StringSplitOptions.None)[0] + input.Split(new string[] { "3D" }, StringSplitOptions.None)[1];
            }



            Regex regex = new Regex(@"\d{4}");
            Match match = regex.Match(input);
            if (match.Success)
            {
                year = match.Value;
            }
            PossibleNames.Add(year);

            if (input.Contains(year) && year.Length > 0)
            {
                input = input.Split(new string[] { year }, StringSplitOptions.None)[0] + input.Split(new string[] { year }, StringSplitOptions.None)[1];
            }

            input = Regex.Replace(input, @"[^0-9a-zA-Z]+", " ");
            string[] SplitOnSpaces = input.Split(' ');

            int amountOfWords = SplitOnSpaces.Length - 1;
            for (int i = 0; i < SplitOnSpaces.Length; i++)
            {
                string possibleAddition = "";
                for (int a = amountOfWords; a != 0; a--)
                {
                    possibleAddition = SplitOnSpaces[a] + " " + possibleAddition;
                }
                amountOfWords = amountOfWords - 1;
                PossibleNames.Add(SplitOnSpaces[0] + " " + possibleAddition);
            }
            return PossibleNames.ToArray();
        }

        private bool ExcludeNames(string name)
        {
            TheseShouldNotBeParsed.Add("season");
            TheseShouldNotBeParsed.Add("seizoen");
            TheseShouldNotBeParsed.Add("VIDEO_TS");
            TheseShouldNotBeParsed.Add("Teem Eoj Kcalb");
            TheseShouldNotBeParsed.Add("Torrents");
            if (startDir.Length > 0)
            {
                List<string> DirsInPath = new List<string>();
                if (startDir.Contains("/"))
                {
                    DirsInPath.AddRange(startDir.Split('/'));

                }
                else
                {
                    DirsInPath.AddRange(startDir.Split('\\'));
                }
                foreach (string dir in DirsInPath)
                {
                    if (dir.Length > 0)
                    {
                        TheseShouldNotBeParsed.Add(dir);
                    }
                }

            }
            foreach (string shouldexclude in TheseShouldNotBeParsed)
            {
                if (name.ToLower().Contains(shouldexclude.ToLower()))
                {
                    return true;
                }
            }

            return false;

        }
    }
}
