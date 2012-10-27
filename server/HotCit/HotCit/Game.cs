using System.Collections.Generic;
using System.Linq;
using HotCit.Data;

namespace HotCit
{
    public class Game
    {
        /****************************************************************************************************/
        /*      Properties send to client                                                                   */
        /****************************************************************************************************/

        public GameStateVector State
        {
            get
            {
                return new GameStateVector
                {
                    PlayerInTurn = GetPlayerInTurn().Username,
                    Step = _step,
                    Round = _round,
                    Description = GetDescription(),
                    Turn = _turn,
                    AbilityUsed = (GetCharacterInTurn() == null) ?
                        (bool?)null :
                        GetCharacterInTurn().AbilityUsed()
                };
            }
        }

        public IList<Player> Players { get; private set; }

        public string King { get; private set; }

        public IEnumerable<string> FaceupCharacters
        {
            get { return _faceupCharacters.Select(c => c.Name); }
        }

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
            GameUpdated += NullUpdate;
            Players = factory.GetPlayers();
            Characters = factory.GetCharacters();
            _characterPile = new List<Character>(Characters);
            _pile = factory.GetPile();
            _discardStrategy = factory.GetDiscardStrategy();

            OnStep();
            King = Players[0].Username;

        }


        /****************************************************************************************************/
        /*  Public methods for getting state                                                                */
        /****************************************************************************************************/

        public Player GetPlayerInTurn()
        {
            switch (_step)
            {
                case Step.RemoveCharacters:
                    return Players.First(p => p.Username == King);
                case Step.ChooseCharacter:
                    return Players[(_count + _playerOffset) % Players.Count];
                case Step.PlayerTurns:
                    return Players.First(p => p.IsCharacter(_count));
                case Step.EndOfRound:
                    return Players.First(p => p.Username == King);
            }
            throw new HotCitException(ExceptionType.IllegalState, "No player in turn");
        }

        public Character GetCharacterInTurn()
        {
            return _step == Step.PlayerTurns ? Characters.First(c => c.No == _count) : null;
        }

        public Player GetPlayerByUsername(string username)
        {
            return Players.First(p => p.Username == username);
        }

        public Player GetPlayerByCharacter(string character)
        {
            return Players.First(p => p.IsCharacter(character));
        }



        /****************************************************************************************************/
        /*  Public methods for getting userspecific data                                                    */
        /****************************************************************************************************/

        public IList<Option> GetOptions(string pid)
        {
            var res = new List<Option>();
            if (pid == GetPlayerInTurn().Username)
                if (_select == null)
                {
                    if (_step == Step.PlayerTurns)
                    {
                        var character = GetCharacterInTurn();
                        res.AddRange(character.GetOptions(this));

                        res.Add(new Option //always posible to end turn
                        {
                            Type = OptionType.EndTurn,
                            Message = "End your turn"
                        });
                        switch (_turn)
                        {
                            case Turn.TakeAnAction:
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
                            case Turn.BuildADistrict:
                                res.Add(new Option
                                {
                                    Message = "Build a district",
                                    Type = OptionType.BuildDistrict,
                                    Choices = GetPlayerInTurn().Hand.
                                        Where(d => d.Price <= GetPlayerInTurn().Gold).
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

        public bool Select(string pid, params string[] cards)
        {
            if (!HasOption(pid, OptionType.Select)) throw new HotCitException(ExceptionType.BadAction, pid + " is not allowed to select cards");
            var res = _select.OnSelect(this, pid, cards);
            if (res)
            {
                var after = _select.AfterSelect();
                _select = null;
                after();
            }
            return res;
        }

        public bool EndTurn(string pid)
        {
            if (!HasOption(pid, OptionType.EndTurn)) return false;
            NextCharacter();
            return true;
        }


        public void UseAbility(string pid, AbilityInfo ability)
        {
            HasOption(pid, OptionType.UseAbility);
            var source = ability.Source;
            var character = GetCharacterInTurn();
            var player = GetPlayerInTurn();
            if (source == character.Name)
            {
                if (character.UseAbility(player, ability, this))
                {
                    GameUpdated(new Update
                    {
                        Type = UpdateType.Player,
                        Player = pid,
                        Message = pid + " used his character ability."
                    });
                }
            }
            else
            {
                var district = player.Hand.First(d => d.Title == source);
                district.UseAbility(player, ability, this);
            }
        }

        public bool TakeGold(string pid)
        {
            if (!HasOption(pid, OptionType.TakeAction)) return false;

            var player = GetPlayerInTurn();

            if (player.IsCharacter("merchant")) player.Gold += 3; //merchant gets an extra gold
            else player.Gold += 2;

            _turn = Turn.BuildADistrict;

            GameUpdated(new Update
            {
                Type = UpdateType.Player,
                Player = pid,
                Message = pid + " used his action to take gold."
            });

            return true;
        }

        public bool DrawDistricts(string pid)
        {
            if (!HasOption(pid, OptionType.TakeAction)) return false;

            var choices = new List<District>();
            for (var i = 0; i < 2; i++)
                choices.Add(_pile.Pop());

            var option = new Option
            {
                Message = "Select a district and discard the other",
                Choices = choices.Select(c => c.Title),
                Amount = 1
            };

            _turn = Turn.BuildADistrict;
            OnSelect = new StandardSelectStrategy(option, SelectDistrict);


            GameUpdated(new Update
            {
                Type = UpdateType.Player,
                Player = pid,
                Message = pid + " used his action to draw districts."
            });

            return true;
        }

        public bool BuildDistrict(string pid, string did)
        {
            if (!HasOption(pid, OptionType.BuildDistrict)) return false;

            var player = GetPlayerInTurn();

            var district = player.Hand.FirstOrDefault(d => d.Price <= player.Gold && d.Title == did);

            if (district == null) return false;

            player.Gold -= district.Price;
            player.Hand.Remove(district);
            player.FullCity.Add(district);

            _turn = null;

            GameUpdated(new Update
            {
                Type = UpdateType.CityAndHand,
                Player = pid,
                Message = pid + " builded a " + did
            });

            return true;
        }



        /****************************************************************************************************/
        /*  Private and internal helper methods                                                             */
        /****************************************************************************************************/

        internal void SetKing(string king) //TODO delegate?
        {
            King = king;
            _playerOffset = Players.IndexOf(GetPlayerByUsername(king)); //king has to be first
            GameUpdated(new Update
            {
                Type = UpdateType.NewKing,
                Player = king,
                Message = king + " is now king."
            });
        }

        private bool HasOption(string pid, OptionType type)
        {
            return GetOptions(pid).Any(o => o.Type == type);
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
                p = GetPlayerInTurn();
            } while (p == null);
            ResetTurn();
            p.RevealCharacter(this);
            GameUpdated(new Update
            {
                Type = UpdateType.PlayerInTurn,
                Message = p.Username + " revealed that he is the " + GetCharacterInTurn().Name,
                Player = p.Username
            });
        }

        private void ResetTurn()
        {
            _turn = Turn.TakeAnAction;
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

            var playerInTurn = GetPlayerInTurn().Username;
            GameUpdated(new Update
            {
                Type = UpdateType.PlayerInTurn,
                Player = playerInTurn,
                Message = playerInTurn + " is now in turn."
            });
        }

        private void EndRound()
        {
            _turn = null;

            //return characters to pile
            _characterPile = new List<Character>(Characters);
            _faceupCharacters.Clear();

            //remove players characters
            foreach (var p in Players)
                p.Reset();


            _step = Step.RemoveCharacters;
        }

        private void OnStep()
        {
            switch (_step)
            {
                case Step.RemoveCharacters:

                    //Round increased by one
                    _round++;

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
            _faceupCharacters.Add(c);

            GameUpdated(new Update
            {
                Type = UpdateType.FaceupCharacters,
                Message = c.Name + " is discarded faceup"
            });
        }

        private void NextStep()
        {
            _count = 0;
            _step++;
            OnStep();
        }

        private string GetDescription()
        {
            var res = "Waiting for " + GetPlayerInTurn().Username + " ";
            switch (_step)
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


        internal bool SwapWithPile(Game game, string pid, string[] cards)
        {
            var player = GetPlayerByUsername(pid);
            foreach (var d in cards.Select(card => player.Hand.First(c => c.Title == card)))
            {
                player.Hand.Remove(d);
                player.Hand.Add(_pile.Pop());
            }

            GameUpdated(new Update
            {
                Type = UpdateType.Hand,
                Player = pid,
                Message = pid + " swapped " + cards.Length + " districts with the pile."
            });
            return true;
        }


        internal District TakeDistrict()
        {
            return _pile.Pop();
        }


        private bool SelectCharacter(Game game, string pid, string[] cards)
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

            return true;
        }


        private void PossibleNextStep()
        {
            //for 3 player games, you can choose two characters
            var max = (Players.Count() == 3) ? 6 : Players.Count();
            if (_count == max) NextStep();
            else SetSelectCharacterStrategy();
        }

        private bool SelectDistrict(Game game, string pid, string[] cards)
        {
            var player = GetPlayerByUsername(pid);

            foreach (var card in cards)
            {
                player.Hand.Add(Resources.GetInstance().GetDistrict(card));
            }

            GameUpdated(new Update
            {
                Type = UpdateType.Hand,
                Player = pid,
                Message = pid + " kept " + cards.Length + " district(s) "
            });

            return true;
        }


        private static void NullUpdate(Update update)
        {
        }


        /****************************************************************************************************/
        /*                   fields                                                                         */
        /****************************************************************************************************/

        public readonly IList<Character> Characters;
        private readonly IList<Character> _faceupCharacters = new List<Character>();
        private readonly Stack<District> _pile;

        private Step _step;
        private int _round, _count;
        private int _playerOffset;
        private Character _discardedCharacter;
        private ISelectStrategy _select;
        private Turn? _turn;
        private IList<Character> _characterPile;



        /****************************************************************************************************/
        /*                   Delegates                                                                      */
        /****************************************************************************************************/

        public GameUpdated GameUpdated;


        /****************************************************************************************************/
        /*                   fields introduces for test purpose                                             */
        /****************************************************************************************************/
        private readonly ICharacterDiscardStrategy _discardStrategy;
    }
}