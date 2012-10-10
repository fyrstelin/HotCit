using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotCit
{
    public interface IRevealStrategy
    {
        bool OnReveal(string owner, Game game);
    }

    public class KingRevealStrategy : IRevealStrategy
    {
        public bool OnReveal(string owner, Game game)
        {
            game.SetKing(owner);
            return true;
        }
    }

    public class NullRevealStrategy : IRevealStrategy
    {
        public bool OnReveal(string owner, Game game)
        {
            return true;
        }
    }
}