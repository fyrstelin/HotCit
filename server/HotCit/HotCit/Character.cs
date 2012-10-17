using System;
using System.Collections.Generic;

namespace HotCit
{
    public class Character : IComparable<Character>
    {
        public string Name { get; set; }
        public string Text { get; set; }
        public string Color { get; set; }
        public int No { get; set; }

        public IAbility CharcterAbility
        {
            set { _ability = value; }
        }
        public IRevealStrategy RevealStrategy
        {
            set { _revealAbility = value; }
        }

        private IAbility _ability;
        private IRevealStrategy _revealAbility;

        public bool UseAbility(Player owner, AbilityInfo info, Game game)
        {
            return _ability.UseAbility(owner, info, game);
        }

        public bool AbilityUsed()
        {
            return _ability.Used;
        }

        public void OnReveal(string owner, Game game)
        {
            _revealAbility.OnReveal(owner, game);
            _ability.Reset();
        }

        public IEnumerable<Option> GetOptions(Game game)
        {
            return _ability.GetOptions(game);
        }

        public bool Dead { set; get; }

        public int CompareTo(Character c)
        {
            return No - c.No;
        }
    }
}