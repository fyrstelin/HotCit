using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;

namespace HotCit
{

    public enum ImageQuality
    {
        mdpi, xldpi, ldpi, hdpi, xhdpi
    }

    public class Resources
    {
        private const string resourcedir = "/Users/afk/Documents/GitHub/HotCit/resources/"; //TODO: Not good enough
        private const string imagedir = resourcedir + "images/";
        
        public ICollection<string> Characters
        {
            get
            {
                return _characters.Keys;
            }
        }

        public ICollection<string> Districts
        {
            get
            {
                return _districts.Keys;
            }
        }


        public static Resources GetInstance()
        {
            return _instance ?? (_instance = new Resources());
        }

        public Character GetCharacter(string id)
        {
            try
            {
                return _characters[id];
            }
            catch (KeyNotFoundException)
            {
                return null;
            }
        }

        public District GetDistrict(string id)
        {
            try
            {
                return _districts[id];
            }
            catch (KeyNotFoundException)
            {
                return null;
            }
        }

        public Stream GetImage(string id, ImageQuality quality)
        {
            try
            {
                var path = imagedir + quality + "/" + id + ".png";
                return new FileStream(path, FileMode.Open);
            }
            catch (FileNotFoundException)
            {
                return null;
            }
        }

        private Resources() {
            var reader = new StreamReader(resourcedir + "characters.txt");
            var content = "";
            using(reader)
            {
                content = reader.ReadToEnd();    
            }
            var characters = content.Split('-');
            foreach (var character in characters)
                ParseAndStoreCharacter(character.Trim());

            reader = new StreamReader(resourcedir + "districts.txt");
            using (reader)
            {
                content = reader.ReadToEnd();
            }
            var districts = content.Split('-');
            foreach (var district in districts)
                ParseAndStoreDistrict(district.Trim());
        }

        private void ParseAndStoreDistrict(string district)
        {
            var args = district.Split('\n');
            string id = null;
            var res = new District();
            foreach (var arg in args)
            {
                string[] t = arg.Split(':');
                var key = t[0].Trim();
                var value = t[1].Trim();
                switch (key)
                {
                    case "Title":
                        id = value;
                        res.Title = value;
                        break;
                    case "Price":
                        res.Price = Int32.Parse(value);
                        break;
                    case "Value":
                        res.Value = Int32.Parse(value);
                        break;
                    case "Color":
                        res.Color = value;
                        break;
                    case "Text":
                        res.Color = value;
                        break;
                    default:
                        break;
                }
            }
            if (id == null) return;
            _districts[id] = res;

        }

        private void ParseAndStoreCharacter(string character)
        {
            var args = character.Split('\n');
            string id = null;
            var res = new Character();
            foreach (var arg in args) {
                string[] t = arg.Split(':');
                var key = t[0].Trim();
                var value = t[1].Trim();
                switch (key)
                {
                    case "Name":
                        id = value;
                        res.Name = value;
                        break;
                    case "Number":
                        res.No = Int32.Parse(value);
                        break;
                    case "Text":
                        res.Text = value;
                        break;
                    case "Color":
                        res.Color = value;
                        break;
                    default:
                        break;
                }
            }
            if (id == null) return;
            _characters[id] = res;
        }

        private static Resources _instance;
        private IDictionary<string, Character> _characters = new Dictionary<string, Character>();
        private IDictionary<string, District> _districts = new Dictionary<string, District>();
    }
}