using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace VixionServer
{
    class DataContainer
    {
        public JObject info { get; set; }
        public List<string> files {get; set;}
        public string ImageB64 { get; set; }
    }
}
