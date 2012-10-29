using HotCit.Data;

namespace HotCit.Strategies
{
    public interface IRevealStrategy
    {
        void OnReveal(Player owner, Game game);
    }

    public class KingRevealStrategy : IRevealStrategy
    {
        public void OnReveal(Player owner, Game game)
        {
            game.King = owner;
        }
    }

    public class NullRevealStrategy : IRevealStrategy
    {
        public void OnReveal(Player owner, Game game)
        {
        }
    }
}