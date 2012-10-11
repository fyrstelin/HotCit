using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotCit
{
    public interface IRevealStrategy
    {
        void OnReveal(string owner, Game game);
    }

    public class KingRevealStrategy : IRevealStrategy
    {
        public void OnReveal(string owner, Game game)
        {
            game.SetKing(owner);
        }
    }

    public class NullRevealStrategy : IRevealStrategy
    {
        public void OnReveal(string owner, Game game)
        {
        }
    }
}