using System.Collections.Generic;
using System.Linq;
using HotCit.Data;
using HotCit.Strategies;
using HotCit.Util;

namespace HotCit
{
    public class Game
    {
        /****************************************************************************************************/
        /*      Properties that courses game change                                                         */
        /****************************************************************************************************/

        public Player PlayerInTurn
        {
            get
            {
                switch (Step)
                {
                    case Step.RemoveCharacters:
                        return King;
                    case Step.ChooseCharacter:
                        return Players[(_count + _playerOffset) % Players.Count];
                    case Step.PlayerTurns:
                        return Players.FirstOrDefault(p => p.IsCharacter(_count));
                    case Step.EndOfRound:
                        return King;
                }
                throw new HotCitException(ExceptionType.IllegalState, "No player in turn");
            }
        }


        //This property never changes
        public IList<Player> Players
        {
            get; private set;
        }

        private Player _king;
        public Player King
        {
            get { return _king; }
            internal set
            {
                _king = value;
                _playerOffset = Players.IndexOf(GetPlayerByUsername(value.Username)); //king has to be first
                PropertyChanged(PropertyChange.King);
            }
        }

        //PropertyChanged for this property is handled in void FaceupCharacter()
        public IList<Character> FaceupCharacters { get; private set; }

        private Turn? _turn;
        public Turn? Turn
        {
            get { return _turn; }
            private set
            {
                PropertyChanged(PropertyChange.Turn);
                _turn = value;
            }
        }

        private Step _step;
        public Step Step
        {
            get { return _step; }
            private set
            {
                PropertyChanged(PropertyChange.Step);
                _step = value;
            }
        }

        private int _round;
        public int Round
        {
            get { return _round; }
            private set
            {
                PropertyChanged(PropertyChange.Round);
                _round = value;
            }
        }


        /****************************************************************************************************/
        /*                   Properties used by other classes                                               */
        /****************************************************************************************************/

        public ISelectStrategy OnSelect
        {
            set
            {
                if (_select == null) _select = value;
                else throw new HotCitException(ExceptionType.IllegalState, "Games is waiting for another select");
            }
        }



        /****************************************************************************************************/
        /*  Constructor                                                                                     */
        /****************************************************************************************************/

        public Game(IGameFactory factory)
        {
            FaceupCharacters = new List<Character>();

            Players = factory.GetPlayers();
            PropertyChanged += factory.GetPropertyChanged();
            Characters = factory.GetCharacters();
            _characterPile = new List<Character>(Characters);
            _pile = factory.GetPile();
            _discardStrategy = factory.GetDiscardStrategy();

            OnStep();
            King = Players[0];

        }


        /****************************************************************************************************/
        /*  Public methods for getting state                                                                */
        /****************************************************************************************************/


        public Character GetCharacterInTurn()
        {
            return Step == Step.PlayerTurns ? Characters.First(c => c.No == _count) : null;
        }

        public Player GetPlayerByUsername(string username)
        {
            return Players.FirstOrDefault(p => p.Username == username);
        }

        public Player GetPlayerByCharacter(string character)
        {
            return Players.FirstOrDefault(p => p.IsCharacter(character));
        }



        /****************************************************************************************************/
        /*  Public methods for getting userspecific data                                                    */
        /****************************************************************************************************/

        public IList<Option> GetOptions(string pid)
        {
            var res = new List<Option>();
            if (pid == PlayerInTurn.Username)
                if (_select == null)
                {
                    if (Step == Step.PlayerTurns)
                    {
                        var character = GetCharacterInTurn();
                        res.AddRange(character.GetOptions(this));

                        res.Add(new Option //always posible to end turn
                        {
                            Type = OptionType.EndTurn,
                            Message = "End your turn"
                        });
                        switch (Turn)
                        {
                            case Data.Turn.TakeAnAction:
                                res.Add(new Option
                                {
                                    Message = "Take 2 gold", //TODO merchant
                                    Type = OptionType.TakeAction,
                                });
                                res.Add(new Option
                                {
                                    Message = "Draw 2 districts and discard one of them", //TODO architect
                                    Type = OptionType.TakeAction,
                                });
                                break;
                            case Data.Turn.BuildADistrict:
                                res.Add(new Option
                                {
                                    Message = "Build a district",
                                    Type = OptionType.BuildDistrict,
                                    Choices = PlayerInTurn.Hand.
                                        Where(d => d.Price <= PlayerInTurn.Gold).
                                        Select(d => d.Title)
                                });
                                break;
                        }
                    }
                }
                else
                    res.Add(_select.GetOption());
            return res;
        }

        public IEnumerable<string> GetHand(string pid)
        {
            return GetPlayerByUsername(pid).Hand.Select(d => d.Title);
        }


        /****************************************************************************************************/
        /*  Public methods for playing the game                                                             */
        /****************************************************************************************************/

        public void Select(string pid, params string[] cards)
        {
            CheckOption(pid, OptionType.Select);
            _select.OnSelect(this, pid, cards);
            var after = _select.AfterSelect();
            _select = null;
            after();
        }

        public void EndTurn(string pid)
        {
            CheckOption(pid, OptionType.EndTurn);
            NextCharacter();
        }


        public void UseAbility(string pid, AbilityInfo ability)
        {
            CheckOption(pid, OptionType.UseAbility);
            var source = ability.Source;
            var character = GetCharacterInTurn();
            var player = PlayerInTurn;
            if (source == character.Name)
            {
                character.UseAbility(player, ability, this);
            }
            else
            {
                var district = player.Hand.First(d => d.Title == source); //TODO throw hotcit exception?
                district.UseAbility(player, ability, this);
            }
        }

        public void TakeGold(string pid)
        {
            CheckOption(pid, OptionType.TakeAction);

            var player = PlayerInTurn;

            if (player.IsCharacter("merchant")) player.Gold += 3; //merchant gets an extra gold
            else player.Gold += 2;

            Turn = Data.Turn.BuildADistrict;
        }

        public void DrawDistricts(string pid)
        {
            CheckOption(pid, OptionType.TakeAction);

            var choices = new List<District>();
            for (var i = 0; i < 2; i++)
                choices.Add(_pile.Pop());

            var option = new Option
            {
                Message = "Select a district and discard the other",
                Choices = choices.Select(c => c.Title),
                Amount = 1
            };

            Turn = Data.Turn.BuildADistrict;
            OnSelect = new StandardSelectStrategy(option, SelectDistrict);

        }

        public void BuildDistrict(string pid, string did)
        {
            CheckOption(pid, OptionType.BuildDistrict);

            var player = PlayerInTurn;

            var district = player.Hand.FirstOrDefault(d => d.Title == did);

            if (district == null) throw new HotCitException(ExceptionType.NotFound, "District '"+ did +"' not found");
            if (district.Price > player.Gold) throw new HotCitException(ExceptionType.NotEnoughGold, did + " is to expensive");

            player.Gold -= district.Price;
            player.Hand.Remove(district);
            player.City.Add(district);

            Turn = null;
        }



        /****************************************************************************************************/
        /*  Private and internal helper methods                                                             */
        /****************************************************************************************************/

        internal void SetKing(Player king) //TODO delegate?
        {
        }

        private void CheckOption(string pid, OptionType type)
        {
            if (GetOptions(pid).Any(o => o.Type == type)) return;
            throw new HotCitException(ExceptionType.BadAction, "You do not have the option: " + type);
        }

        private void NextCharacter()
        {
            Player p;
            do
            {
                _count++;
                if (_count > Characters.Count)
                {
                    NextStep();
                    return;
                }
                p = PlayerInTurn;
            } while (p == null);
            ResetTurn();
            p.RevealCharacter(this);
            PropertyChanged(PropertyChange.PlayerInTurn);
        }

        private void ResetTurn()
        {
            Turn = Data.Turn.TakeAnAction;
        }

        private void RemoveCharacters()
        {
            var players = Players.Count();

            //discard one character
            _discardedCharacter = _discardStrategy.DiscardCharacter(_characterPile);
            _characterPile.Remove(_discardedCharacter);

            switch (players)
            {
                case 4: //for 4 characters: 2 faceup characters
                    FaceUpCharacter();
                    FaceUpCharacter();
                    break;
                case 5: //for 5 characters: 1 faceup character
                    FaceUpCharacter();
                    break;
            }
        }

        private void SetSelectCharacterStrategy()
        {
            var option = new Option
            {
                Type = OptionType.Select,
                Message = "Please select a character",
                Choices = _characterPile.Select(c => c.Name),
                Amount = 1
            };
            OnSelect = new StandardSelectStrategy(option, SelectCharacter, PossibleNextStep);

            PropertyChanged(PropertyChange.PlayerInTurn);
        }

        private void EndRound()
        {
            Turn = null;

            //return characters to pile
            _characterPile = new List<Character>(Characters);
            FaceupCharacters.Clear();

            //remove players characters
            foreach (var p in Players)
                p.Reset();


            Step = Step.RemoveCharacters;
        }

        private void OnStep()
        {
            switch (Step)
            {
                case Step.RemoveCharacters:

                    //Round increased by one
                    Round++;

                    RemoveCharacters();

                    //no player interactions in sted 1
                    NextStep();
                    break;

                case Step.ChooseCharacter:
                    SetSelectCharacterStrategy();
                    break;
                case Step.PlayerTurns:
                    NextCharacter();
                    break;
                case Step.EndOfRound:
                    //clear up statevector
                    EndRound();

                    OnStep(); //recurse
                    break;

            }
        }

        private void FaceUpCharacter()
        {
            var c = _discardStrategy.FaceupCharacter(_characterPile);

            _characterPile.Remove(c);
            FaceupCharacters.Add(c);

            PropertyChanged(PropertyChange.FaceupCharacters);
        }

        private void NextStep()
        {
            _count = 0;
            Step++;
            OnStep();
        }

        private string GetDescription()
        {
            var res = "Waiting for " + PlayerInTurn.Username + " ";
            switch (Step)
            {
                case Step.RemoveCharacters:
                    res += "to shuffle cards";
                    break;
                case Step.ChooseCharacter:
                    res += "to choose character";
                    break;
                case Step.PlayerTurns:
                    res += "to take turn";
                    break;
                case Step.EndOfRound:
                    res += "to collect characters";
                    break;
            }
            return res;
        }


        /****************************************************************************************************/
        /*                   method used as delegates                                                       */
        /****************************************************************************************************/


        internal void SwapWithPile(Game game, string pid, string[] cards)
        {
            var player = GetPlayerByUsername(pid);
            foreach (var d in cards.Select(card => player.Hand.First(c => c.Title == card)))
            {
                player.Hand.Remove(d);
                player.Hand.Add(_pile.Pop());
            }
        }


        internal District TakeDistrict()
        {
            return _pile.Pop();
        }


        private void SelectCharacter(Game game, string pid, string[] cards)
        {
            var player = GetPlayerByUsername(pid);
            var character = _characterPile.First(c => c.Name == cards[0]);

            player.AddCharacter(character);
            _characterPile.Remove(character);

            //For 7 player game the last player should have two characters to choose from
            if (_characterPile.Count == 1)
            {
                _characterPile.Add(_discardedCharacter);
                _discardedCharacter = null;
            }

            _count++;
        }


        private void PossibleNextStep()
        {
            //for 3 player games, you can choose two characters
            var max = (Players.Count() == 3) ? 6 : Players.Count();
            if (_count == max) NextStep();
            else SetSelectCharacterStrategy();
        }

        private void SelectDistrict(Game game, string pid, string[] cards)
        {
            var player = GetPlayerByUsername(pid);

            foreach (var card in cards)
            {
                player.Hand.Add(Resources.GetInstance().GetDistrict(card));
            }
        }


        /****************************************************************************************************/
        /* Fields                                                                                           */
        /****************************************************************************************************/

        public readonly IList<Character> Characters;
        private readonly Stack<District> _pile;

        private int _count;
        private int _playerOffset;
        private Character _discardedCharacter;
        private ISelectStrategy _select;
        private IList<Character> _characterPile;



        /****************************************************************************************************/
        /*                   Delegates                                                                      */
        /****************************************************************************************************/

        private PropertyChanged _propertyChanged;
        public PropertyChanged PropertyChanged
        {
            get { return _propertyChanged; }
            set
            {
                foreach (var p in Players) p.PropertyChanged = value;
                _propertyChanged = value;
            }
        }


        /****************************************************************************************************/
        /*                   fields introduces for test purpose                                             */
        /****************************************************************************************************/
        private readonly ICharacterDiscardStrategy _discardStrategy;
    }
}