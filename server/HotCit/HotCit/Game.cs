using System;
using System.Collections.Generic;
using System.Linq;

namespace HotCit
{
    public class Game
    {

        public GameStateVector State
        {
            get
            {
                return new GameStateVector {
                    PlayerInTurn = GetPlayerInTurn().Username,
                    Step = _step,
                    Round = _round,
                    Description = GetDescription()
                };
            }
        }

        public IList<Player> Players
        {
            get
            {
                return _players;
            }
        }

        public string King { get; private set; }

        public IEnumerable<string> FaceupCharacters
        {
            get { return _faceupCharacters.Select(c => c.Name); }
        }

        public Game(IGameFactory factory)
        {
            _players = factory.GetPlayers();
            _characters = factory.GetCharacters();
            _pile = factory.GetPile();
            _discardStrategy = factory.GetDiscardStrategy();

            NextStep();
            King = _players[0].Username;
        }

        public Player GetPlayerInTurn()
        {
            switch (_step)
            {
                case 1:
                    return _players.First(p => p.Username == King);
                case 2:
                    return _players[(_count + _playerOffset) % _players.Count];
                case 3:
                    try
                    {
                        return _players.First(p => p.IsCharacter(_count));
                    } catch (InvalidOperationException)
                    {
                        return null;
                    }
                case 4:
                    return _players.First(p => p.Username == King);
            }
            return null;
        }

        public bool IsPlayerInTurn(string pid)
        {
            return GetPlayerInTurn().Username == pid;
        }

        public Player GetPlayer(string pid)
        {
            return _players.First(p => p.Username == pid);
        }

        public bool Select(string pid, string card)
        {
            switch (_step)
            {
                case 1: return false;
                case 2: return SelectCharacter(pid, card);
                case 3: return false;
                case 4: return false;
                default: throw new InvalidOperationException("Cannot be in step " + _step);
            }
        }

        public bool EndTurn(string pid)
        {
            switch (_step)
            {
                case 1:
                    return false;
                case 2:
                    return false;
                case 3:
                    if (IsPlayerInTurn(pid))
                    {
                        NextCharacter();
                        return true;
                    }
                    return false;
                case 4:
                    return false;
                default: throw new InvalidOperationException("Cannot be in step " + _step);
            }
        }

        public void SetKing(string king)
        {
            King = king;
            _playerOffset = _players.IndexOf(GetPlayer(king)); //king has to be first
        }

        private void NextCharacter()
        {
            Player p;
            do
            {
                _count++;
                if (_count > _characters.Count)
                {
                    NextStep();
                    return;
                }
                p = GetPlayerInTurn();
            } while (p == null);
            p.RevealCharacter(this);
        }

        private bool SelectCharacter(string pid, string card)
        {
            if (pid != GetPlayerInTurn().Username) return false;

            var player = GetPlayer(pid);
            try
            {
                var character = _characterPile.First(c => c.Name == card);

                player.AddCharacter(character);
                _characterPile.Remove(character);

                //
                if (_characterPile.Count == 1)
                {
                    _characterPile.Add(_discardedCharacter);
                    _discardedCharacter = null;
                }

                _count++;

                //for 3 player games, you can choose two characters
                var max = (_players.Count == 3) ? 6 : _players.Count;
                if (_count == max) NextStep();

                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }

        }

        private void BeforeStep()
        {
            switch (_step)
            {
                case 2:
                    //return characters to pile
                    _characterPile = new List<Character>(_characters);
                    _faceupCharacters.Clear();

                    //remove playes characters
                    foreach (var p in _players)
                        p.ClearCharacters();


                    var players = Players.Count;

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

                    //no player interactions in sted 1
                    break;
                case 3:
                    NextCharacter();
                    break;
            }
        }

        private void FaceUpCharacter()
        {
            Character c;
            do
            {
                c = _characterPile[_random.Next(_characterPile.Count)];
            } while (c.No == 4); // king should not be faceup
            _characterPile.Remove(c);
            _faceupCharacters.Add(c);
        }

        private void NextStep()
        {
            _count = 0;
            _step++;
            if (_step > 3) NextRound();
            BeforeStep();
        }

        private void NextRound()
        {
            _step = 2;
            _round++;
        }

        private string GetDescription()
        {
            var res = "Waiting for " + GetPlayerInTurn().Username + " ";
            switch (_step)
            {
                case 1:
                    res += "to shuffle cards";
                    break;
                case 2:
                    res += "to select character";
                    break;
                case 3:
                    res += "to take turn";
                    break;
                case 4:
                    res += "to collect characters";
                    break;
            }
            return res;
        }

        public IList<Option> GetOptions(string pid)
        {
            var res = new List<Option>();

            switch (_step)
            {
                case 1:

                case 2:
                    if (pid == GetPlayerInTurn().Username)
                    {
                        var opt = new Option
                            {
                                Type = OptionType.Select,
                                Message = "Please select a character",
                                Choices = _characterPile.Select(c => c.Name)
                            };
                        res.Add(opt);
                    }
                    break;
                case 3:
                    if (pid == GetPlayerInTurn().Username)
                    {
                        var opt = new Option
                            {
                                Type = OptionType.EndTurn,
                                Message = "End your turn"
                            };
                        res.Add(opt);
                    }
                    break;
            }
            return res;
        }


        private readonly IList<Player> _players;
        
        
        private readonly IList<Character> _characters;
        private IList<Character> _characterPile;
        private readonly IList<Character> _faceupCharacters = new List<Character>(); 

        private readonly Stack<District> _pile;

        private int _round, _step = 1, _count;
        private readonly Random _random = new Random();
        private int _playerOffset;
        private Character _discardedCharacter;


        //Fields for stubs
        private readonly ICharacterDiscardStrategy _discardStrategy;
    }
}