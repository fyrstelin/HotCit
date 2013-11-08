using System;
using System.Collections.Generic;
using System.IO;
using HotCit.Data;
using HotCit.Strategies;

namespace HotCit.Util
{

    public enum ImageQuality
    {
        Mdpi, Xldpi, Ldpi, Hdpi, Xhdpi
    }

    public class Resources
    {
        private static readonly string Resourcedir = @"resources\";
        private static readonly string Imagedir = Resourcedir + @"images\";

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
                Console.WriteLine("Getting " + id + " in " + quality);
                var path = Imagedir + quality + "/" + id + ".png";
                return new FileStream(path, FileMode.Open);
            }
            catch (FileNotFoundException)
            {
                return null;
            }
        }

        private Resources()
        {
            var reader = new StreamReader(Resourcedir + "characters.txt");
            string content;
            using (reader)
            {
                content = reader.ReadToEnd();
            }
            var characters = content.Split('-');
            foreach (var character in characters)
                ParseAndStoreCharacter(character.Trim());

            reader = new StreamReader(Resourcedir + "districts.txt");
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
                var t = arg.Split(':');
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
            foreach (var arg in args)
            {
                var t = arg.Split(':');
                var key = t[0].Trim();
                var value = t[1].Trim();
                switch (key)
                {
                    case "Name":
                        id = value;
                        res.Name = value;
                        res.Ability = GetCharacterAbility(value);
                        res.RevealStrategy = GetRevealAbility(value);
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
                }
            }
            if (id == null) return;
            _characters[id] = res;
        }

        private static IAbility GetCharacterAbility(string name)
        {
            switch (name)
            {
                case "assassin": return new AssassinAbility();
                case "thief": return new ThiefAbility();
                case "magician": return new MagicianAbility();
                case "king": return new GoldAbility("noble", "yellow", "king");
                case "bishop": return new GoldAbility("religuous", "blue", "bishop");
                case "merchant": return new GoldAbility("trade", "green", "merchant");
                case "warlord": return new WarlordAbilty();
            }
            return new NullAbility();
        }

        private static IRevealStrategy GetRevealAbility(string name)
        {
            switch (name)
            {
                case "king": return new KingRevealStrategy();
            }
            return new NullRevealStrategy();
        }

        private static Resources _instance;
        private readonly IDictionary<string, Character> _characters = new Dictionary<string, Character>();
        private readonly IDictionary<string, District> _districts = new Dictionary<string, District>();
    }
}