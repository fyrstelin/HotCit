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
                return FullCity.Select(d => d.Title);
            }
        }

        public int NumberOfCards
        {
            get
            {
                return Hand.Count;
            }
        }

        public int Points
        {
            get
            {
                return FullCity.Sum(d => d.Value); //TODO: more complex
            }
        }

        public int Gold { get; set; }

        public IEnumerable<string> Characters
        {
            get { return _publicCharacters.Select(c => c.Name); }
        }

        public Player(string username)
        {
            _username = username;

        }
        
        public bool AddCharacter(Character c)
        {
            if (_hiddenCharacters.Contains(c)) return false;
            _hiddenCharacters.Add(c);
            return true;
        }

        public void ClearCharacters()
        {
            _hiddenCharacters.Clear();
            _publicCharacters.Clear();
        }

        public bool RevealCharacter(Game game)
        {
            try
            {
                var c = _hiddenCharacters.Min();
                if (c == null) return false;

                c.OnReveal(_username, game);
                

                if (c.Name == _victim)
                {
                    _thief.Gold += Gold;
                    Gold = 0;
                }

                _hiddenCharacters.Remove(c);
                _publicCharacters.Add(c);
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }

        }

        public bool IsCharacter(int no)
        {
            return
                _hiddenCharacters.Any(c => c.No == no) ||
                _publicCharacters.Any(c => c.No == no);
        }

        public bool IsCharacter(string title)
        {
            return
                _hiddenCharacters.Any(c => c.Name == title) ||
                _publicCharacters.Any(c => c.Name == title);
        }

        public void RobbedBy(string character, Player owner)
        {
            _victim = character;
            _thief = owner;
        }

        public void SwapHand(Player target)
        {
            var temp = Hand;
            Hand = target.Hand;
            target.Hand = temp;
        }

        public void SwapHand(IList<string> districts, Game game)
        {
            var d = districts.FirstOrDefault(d1 => Hand.All(d2 => d2.Title != d1));
            if (d!=null) throw new IllegalAction("You do not have " + d + " in your hand, and therefore cannot swap it");    
            foreach (var d1 in districts)
            {
                Hand.Remove(Hand.First(d2 => d2.Title == d1));
            }
        }


        private readonly string _username;
        public readonly IList<District> FullCity = new List<District>();
        public IList<District> Hand = new List<District>();
        private readonly ISet<Character> _hiddenCharacters = new SortedSet<Character>();
        private readonly ISet<Character> _publicCharacters = new SortedSet<Character>(); 
        private Player _thief;
        private string _victim;

    }
}