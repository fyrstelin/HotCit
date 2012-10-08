using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotCit
{
    public class Character
    {
        public string Name { get; set; }
        public string Text { get; set; }
        public string Color { get; set; }
        public int No { get; set; }
    }

    public class District
    {
        public string Title { get; set; }
        public int Price { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
        public string Text { get; set; }
    }
}