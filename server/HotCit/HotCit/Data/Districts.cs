using HotCit.Strategies;
using HotCit.Util;

namespace HotCit.Data
{
    public class District
    {
        public string Title { get; set; }
        public int Price { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
        public string Text { get; set; }

        public IAbility Ability { private get; set; }

        public bool HaveAbility
        {
            get
            {
                return Ability != null && Ability.Used;
            }
        }

        public void UseAbility(Player player, AbilityInfo ability, Game game)
        {
            if (Ability == null) throw new HotCitException(ExceptionType.BadAction, Title + " do not have an ability");
            Ability.UseAbility(player, ability, game);
        }

        public void Reset()
        {
            if (Ability!= null) Ability.Reset();
        }
    }

}