using System;
using System.Collections.Generic;

namespace HotCit
{
    public class UserGameFactory : IGameFactory
    {
        private const int StdMinPlayers = 2, StdMaxPlayers = 8;


        private readonly int _minPlayers, _maxPlayers;
        private readonly string _password;
        private readonly IList<string> _players = new List<string>();
        private readonly ISet<string> _readyPlayers = new HashSet<string>();


        public int MinPlayers
        {
            get { return _minPlayers; }
        }

        public int MaxPlayers
        {
            get { return _maxPlayers; }
        }

        public bool PasswordProtected
        {
            get { return _password != null; }
        }

        public int PlayerCount
        {
            get { return _players.Count; }
        }

        public UserGameFactory(int minPlayers, int maxPlayers, string password)
        {
            _minPlayers = minPlayers == 0 ? StdMinPlayers : minPlayers;
            _maxPlayers = maxPlayers == 0 ? StdMaxPlayers : maxPlayers;
            _password = password;
        }

        public bool Join(string player)
        {
            if (_players.Count < _maxPlayers)
            {
                if (!_players.Contains(player))
                    _players.Add(player);
                return true;
            }
            return false;
        }

        public bool Leave(string player)
        {
            return _players.Remove(player);
        }

        public bool SetReady(string player, bool ready)
        {
            if (!_players.Contains(player)) throw new Exception("Exception in UserGameFactory.SetReady");
            if (ready)
                _readyPlayers.Add(player);
            else
                _readyPlayers.Remove(player);
            return _readyPlayers.Count == _players.Count;
        }

        public IDictionary<string, bool> GetPlayers()
        {
            var res = new Dictionary<string, bool>();
            foreach (var player in _players)
            {
                res[player] = _readyPlayers.Contains(player);
            }
            return res;
        }
    }
}