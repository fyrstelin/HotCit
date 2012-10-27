using System.Collections.Generic;
using HotCit.Data;
using HotCit.Strategies;

namespace HotCit
{
    public interface IGameFactory
    {

        IList<Player> GetPlayers();
        IList<Character> GetCharacters();
        Stack<District> GetPile();
        ICharacterDiscardStrategy GetDiscardStrategy();
    }

    public delegate void GameUpdated(Update update);

    public class Update
    {
        public UpdateType Type { get; set; }
        public string Message { get; set; }
        public string Player { get; set; }
    }

    public enum UpdateType
    {
        Full, Player, CityAndHand, Hand, Character, PlayerInTurn,
        NewKing,
        FaceupCharacters
    }
}