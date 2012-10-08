using System.Collections.Generic;

namespace HotCit
{
    public class GameFactoryRepository
    {
        public IDictionary<string, UserGameFactory> GameFactories
        {
            get
            {
                return new Dictionary<string, UserGameFactory>(_gameFactories); //data integrety
            }
        }

        public UserGameFactory GetFactory(string id)
        {
            try
            {
                return _gameFactories[id];    
            } catch(KeyNotFoundException)
            {
                return null;
            }
            
        }

        public bool AddGameFactory(string id, UserGameFactory gameFactory)
        {
            if (_gameFactories.ContainsKey(id))
                return false;
            _gameFactories[id] = gameFactory;
            return true;
        }

        public bool RemoveGameFactory(string id)
        {
            return _gameFactories.Remove(id);
        }

        public static GameFactoryRepository GetInstance()
        {
            return _instance ?? (_instance = new GameFactoryRepository());
        }


        private GameFactoryRepository() {}
        private readonly IDictionary<string, UserGameFactory> _gameFactories = new Dictionary<string, UserGameFactory>();
        private static GameFactoryRepository _instance;
    }

    public class GameRepository
    {
        public IDictionary<string, IGame> Games
        {
            get
            {
                return new Dictionary<string, IGame>(_games); //data integrety
            }
        } 

        public bool AddGame(string id, IGame game)
        {
            if (_games.ContainsKey(id))
            {
                return false;
            }
            _games[id] = game;
            return true;
        }

        public IGame GetGame(string id)
        {
            try
            {
                return _games[id];
            }
            catch(KeyNotFoundException)
            {
                return null;
            }
        }


        public static GameRepository GetInstance()
        {
            return _instance ?? (_instance = new GameRepository());
        }
        private GameRepository() { }

        private static GameRepository _instance;
        private readonly IDictionary<string, IGame> _games = new Dictionary<string, IGame>();



    }
}