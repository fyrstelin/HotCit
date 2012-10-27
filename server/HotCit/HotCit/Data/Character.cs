using System;
using System.Collections.Generic;
using HotCit.Strategies;

namespace HotCit.Data
{
    public class Character : IComparable<Character>
    {
        public string Name { get; set; }
        public string Text { get; set; }
        public string Color { get; set; }
        public int No { get; set; }

        public IAbility Ability { private get; set; }

        public IRevealStrategy RevealStrategy { private get; set; }

        public bool UseAbility(Player owner, AbilityInfo info, Game game)
        {
            return Ability.UseAbility(owner, info, game);
        }

        public bool AbilityUsed()
        {
            return Ability.Used;
        }

        public void OnReveal(string owner, Game game)
        {
            RevealStrategy.OnReveal(owner, game);
        }

        public IEnumerable<Option> GetOptions(Game game)
        {
            return Ability.GetOptions(game);
        }

        public bool Dead { set; get; }

        public int CompareTo(Character c)
        {
            return No - c.No;
        }

        internal void Reset()
        {
            Ability.Reset();
        }
    }
}