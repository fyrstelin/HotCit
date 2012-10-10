using System;
using System.Collections.Generic;
using System.Linq;

namespace HotCit
{


    public class Player
    {
        public string Username
        {
            get
            {
                return _username;
            }
        }

        public IEnumerable<string> City
        {
            get
            {
                return _city.Select(d => d.Title);
            }
        }

        public int NumberOfCards
        {
            get
            {
                return _hand.Count;
            }
        }

        public int Points
        {
            get
            {
                return _city.Sum(d => d.Value); //TODO: more complex
            }
        }

        public int Gold { get; set; }

        public IEnumerable<string> Character
        {
            get { return from c in _characters where c.Value select c.Key.Name; }
        }

        public Player(string username)
        {
            _username = username;

        }
        
        public bool AddCharacter(Character c)
        {
            if (_characters.ContainsKey(c)) return false;
            _characters[c] = false;
            return true;
        }

        public void ClearCharacters()
        {
            _characters.Clear();
        }

        public bool RevealCharacter(Game game)
        {
            try
            {
                var c = _characters.First(p => !p.Value).Key;
                c.OnReveal(_username, game);
                _characters[c] = true;
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }

        }

        public bool IsCharacter(int count)
        {
            return _characters.Keys.Any(c => c.No == count);
        }


        private readonly string _username;
        private readonly IList<District> _city = new List<District>();
        private readonly IList<District> _hand = new List<District>();
        private readonly IDictionary<Character, bool> _characters = new Dictionary<Character, bool>();

    }
}