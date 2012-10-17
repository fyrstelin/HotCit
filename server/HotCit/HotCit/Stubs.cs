using System.Collections.Generic;
using System.Linq;

namespace HotCit
{
    public class SimpleGameFactory : IGameFactory
    {
        public IList<Player> GetPlayers()
        {
            return new List<Player>
                {
                    new Player("afk") {Gold = 2},
                    new Player("tugend") {Gold = 2},
                    new Player("rko") {Gold = 2},
                    new Player("mis") {Gold = 2}
                };
        }

        public IList<Character> GetCharacters()
        {
            var r = Resources.GetInstance();

            return r.Characters.Select(r.GetCharacter).ToList();
        }

        public Stack<District> GetPile()
        {
            var res = new Stack<District>();
            var r = Resources.GetInstance();

            for (var i = 0; i < 4; i++)
            {
                res.Push(r.GetDistrict("castle"));
                res.Push(r.GetDistrict("harbor"));
                res.Push(r.GetDistrict("docks"));
                res.Push(r.GetDistrict("tavern"));
            }
            return res;
        }

        public ICharacterDiscardStrategy GetDiscardStrategy()
        {
            return new FixedDiscardStrategy {CharacterNumber = 7};
        }
    }
}