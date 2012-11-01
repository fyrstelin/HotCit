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
        PropertyChanged GetPropertyChanged();
    }

    public delegate void PropertyChanged(PropertyChange type, string player = null);

    public enum PropertyChange
    {
        All,

        //Game properties
        King,
        PlayerInTurn,
        FaceupCharacters,
        Turn,
        Step,
        Round,

        //Player properties
        PlayerGold,
        PlayerCharacters,
        PlayerCity,
        PlayerHand
    }
}