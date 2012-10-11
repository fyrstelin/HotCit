using System.Collections.Generic;

namespace HotCit
{
    public interface IGameFactory
    {
        IList<Player> GetPlayers();
        IList<Character> GetCharacters();
        Stack<District> GetPile();


        ICharacterDiscardStrategy GetDiscardStrategy();
    }
}