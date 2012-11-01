using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using HotCit.Data;

namespace HotCit.Server
{
    public class BlockingGameListener
    {
        private class Property
        {
            private bool Equals(Property other)
            {
                return Change.Equals(other.Change) && string.Equals(Player, other.Player);
            }

            public override int GetHashCode()
            {
                unchecked
                {
                    return (Change.GetHashCode()*397) ^ (Player != null ? Player.GetHashCode() : 0);
                }
            }

            public Property(PropertyChange change, string player)
            {
                Change = change;
                Player = player;
            }

            public readonly PropertyChange Change;
            public readonly string Player;

            public override bool Equals(object obj)
            {
                if (ReferenceEquals(null, obj)) return false;
                if (ReferenceEquals(this, obj)) return true;
                return obj.GetType() == GetType() && Equals((Property) obj);
            }
        }

        public int Now { get; private set; }
        private readonly Game _game;
        private readonly IDictionary<int, Property> _changes = new SortedDictionary<int, Property>(); 

        public BlockingGameListener(Game game)
        {
            Now = 0;
            game.PropertyChanged += PropertyChanged;
            _game = game;
            _changes.Add(Now, new Property(PropertyChange.All, null));
        }

        private void PropertyChanged(PropertyChange type, string player)
        {
            lock (_changes)
            {
                Now++;
                //remove overrides
                foreach (var i in _changes.Where((id, prop) => prop.Equals(type)).Select((id, prop) => id))
                    _changes.Remove(i);
                _changes[Now] = new Property(type, player);
                Monitor.PulseAll(_changes);
            }
        }

        public KeyValuePair<int, GameResponse> GetGame(int lastSeenGame)
        {
            int etag;

            lock (_changes)
            {
                while (_changes.Keys.Max() <= lastSeenGame)
                    Monitor.Wait(_changes);
                etag = _changes.Keys.Max();
            }

            var changes = _changes.Where(pair => pair.Key > lastSeenGame);
            var res = new GameResponse();
            foreach (var change in changes.Select(pair => pair.Value))
            {
                var user = change.Player;
                if (user != null)
                {
                    var player = res.AddPlayer(user);
                    switch (change.Change)
                    {
                        case PropertyChange.PlayerCity:
                            Debug.Assert(player != null, "player != null");
                            player.City = _game.GetPlayerByUsername(user).City.Select(d => d.Title);
                            break;
                        case PropertyChange.PlayerHand:
                            Debug.Assert(player != null, "player != null");
                            player.NumberOfCards = _game.GetPlayerByUsername(user).Hand.Count;
                            break;
                        case PropertyChange.PlayerCharacters:
                            Debug.Assert(player != null, "player != null");
                            player.Characters = _game.GetPlayerByUsername(user).Characters.Select(c => c.Name);
                            break;
                        case PropertyChange.PlayerGold:
                            Debug.Assert(player != null, "player != null");
                            player.Gold = _game.GetPlayerByUsername(user).Gold;
                            break;

                    }
                }
                else
                {

                    switch (change.Change)
                    {
                        case PropertyChange.Turn:
                            res.Turn = _game.Turn;
                            break;
                        case PropertyChange.Step:
                            res.Step = _game.Step;
                            break;
                        case PropertyChange.FaceupCharacters:
                            res.FaceUpCharacters = _game.FaceupCharacters.Select(c => c.Name);
                            break;
                        case PropertyChange.King:
                            res.King = _game.King.Username;
                            break;
                        case PropertyChange.PlayerInTurn:
                            res.PlayerInTurn = _game.PlayerInTurn.Username;
                            break;
                        case PropertyChange.Round:
                            res.Round = _game.Round;
                            break;
                        case PropertyChange.All:
                            return new KeyValuePair<int, GameResponse>(etag, new GameResponse(_game));
                    }
                }
            }
            return new KeyValuePair<int, GameResponse>(etag, res);
        }
    }
}