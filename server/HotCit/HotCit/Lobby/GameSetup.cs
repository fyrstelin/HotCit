using System.Collections.Generic;
using System.Linq;
using HotCit.Data;
using HotCit.Strategies;
using HotCit.Util;

namespace HotCit.Lobby
{
    public class GameSetup : IGameFactory
    {
        private const int StdMinPlayers = 3, StdMaxPlayers = 7;


        private readonly int _minPlayers, _maxPlayers;
        private readonly string _password;
        private readonly IList<string> _users = new List<string>();
        private readonly ISet<string> _readyUsers = new HashSet<string>();
        private readonly ICharacterDiscardStrategy _discardStrategy;


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
            get { return _users.Count; }
        }

        public GameSetup(int? minPlayers, int? maxPlayers, string password, ICharacterDiscardStrategy discardStrategy)
        {
            _minPlayers = minPlayers ?? StdMinPlayers;
            _maxPlayers = maxPlayers ?? StdMaxPlayers;
            _password = password;
            _discardStrategy = discardStrategy;
        }

        public bool Join(string user)
        {
            if (_users.Count < _maxPlayers)
            {
                if (!_users.Contains(user))
                    _users.Add(user);
                return true;
            }
            return false;
        }

        public bool Leave(string user)
        {
            return _users.Remove(user);
        }

        public bool SetReady(string user, bool ready)
        {
            if (!_users.Contains(user)) return false;
            if (ready)
                _readyUsers.Add(user);
            else
                _readyUsers.Remove(user);
            return _readyUsers.Count == _users.Count && _users.Count >= _minPlayers && _users.Count <= _maxPlayers;
        }

        public IDictionary<string, bool> GetUsers()
        {
            var res = new Dictionary<string, bool>();
            foreach (var user in _users)
            {
                res[user] = _readyUsers.Contains(user);
            }
            return res;
        }

        public IList<Player> GetPlayers()
        {
            return _users.Select(user => new Player(user)).ToList();
        }

        public Stack<District> GetPile()
        {
            var res = new Stack<District>();
            foreach (var d in Resources.GetInstance().Districts)
                res.Push(Resources.GetInstance().GetDistrict(d));
            return res;
        }

        public ICharacterDiscardStrategy GetDiscardStrategy()
        {
            return _discardStrategy;
        }

        public IList<Character> GetCharacters()
        {
            return Resources.GetInstance().Characters.Select(c => Resources.GetInstance().GetCharacter(c)).ToList();
        }
    }
}