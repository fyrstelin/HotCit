using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using HotCit.Util;

namespace HotCit.Data
{
    public class Player
    {
        /****************************************************************************************************/
        /* Properties                                                                                       */
        /****************************************************************************************************/
        public string Username { get; private set; }

        public IList<District> City { get; private set; }

        public IList<District> Hand {get; private set;}

        private int _gold;
        public int Gold
        {
            get { return _gold; }
            set
            {
                if (value < 0)
                    throw new HotCitException(ExceptionType.NotEnoughGold, "You need " + -value + " more gold");
                PropertyChanged(PropertyChange.PlayerGold, Username);
                _gold = value;
            }
        }

        public IList<Character> Characters { get; private set; }

        public ISet<Character> HiddenCharacters { get; private set; }


        /****************************************************************************************************/
        /* Constructor                                                                                      */
        /****************************************************************************************************/

        public Player(string username)
        {
            PropertyChanged = (type, player) => { };
            Username = username;
            
            var city = new ObservableCollection<District>();
            city.CollectionChanged += CityChanged;
            City = city;

            var characters = new ObservableCollection<Character>();
            characters.CollectionChanged += CharactersChanged;
            Characters = characters;

            var hand = new ObservableCollection<District>();
            hand.CollectionChanged += HandChanged;
            Hand = hand;

            HiddenCharacters = new SortedSet<Character>();
        }


        /****************************************************************************************************/
        /* Public methods                                                                                   */
        /****************************************************************************************************/

        public bool AddCharacter(Character c)
        {
            if (HiddenCharacters.Contains(c)) return false;
            HiddenCharacters.Add(c);
            return true;
        }

        public void Reset()
        {
            HiddenCharacters.Clear();
            foreach (var c in Characters)
            {
                c.Reset();
            }
            Characters.Clear();
        }

        public bool RevealCharacter(Game game)
        {
            try
            {
                var c = HiddenCharacters.First(ch => !ch.Dead);
                if (c == null) return false;

                c.OnReveal(this, game);


                if (c.Name == _victim)
                {
                    _thief.Gold += Gold;
                    Gold = 0;
                }

                HiddenCharacters.Remove(c);
                Characters.Add(c);

                foreach (var d in City)
                    d.Reset();
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
                HiddenCharacters.Any(c => c.No == no && !c.Dead) ||
                Characters.Any(c => c.No == no);
        }

        public bool IsCharacter(string title)
        {
            return
                HiddenCharacters.Any(c => c.Name == title && !c.Dead) ||
                Characters.Any(c => c.Name == title);
        }

        /****************************************************************************************************/
        /* Public helper methods                                                                            */
        /****************************************************************************************************/

        public void RobbedBy(string character, Player owner)
        {
            _victim = character;
            _thief = owner;
        }

        public void SwapHand(Player target)
        {
            var temp = Hand;
            Hand.Clear();
            foreach (var d in target.Hand)
                Hand.Add(d);

            target.Hand.Clear();
            foreach (var d in temp)
            {
                target.Hand.Add(d);
            }
        }


        /****************************************************************************************************/
        /* Fields                                                                                           */
        /****************************************************************************************************/

        private Player _thief;
        private string _victim;


        /****************************************************************************************************/
        /* PropertyChanged                                                                                  */
        /****************************************************************************************************/

        public PropertyChanged PropertyChanged;

        private void CharactersChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            PropertyChanged(PropertyChange.PlayerCharacters, Username);
        }

        private void CityChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            PropertyChanged(PropertyChange.PlayerCity, Username);
        }

        private void HandChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            PropertyChanged(PropertyChange.PlayerHand, Username);
        }
    }
}