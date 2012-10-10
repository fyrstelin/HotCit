namespace HotCit
{
    public class AbilityInfo
    {
        
    }

    public interface IAbility
    {
        bool UseAbility(string owner, AbilityInfo info, Game game);
    }

    public class NullAbility : IAbility
    {
        public bool UseAbility(string owner, AbilityInfo info, Game game)
        {
            return true;
        }
    }
}