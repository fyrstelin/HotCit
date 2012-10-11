using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotCit
{
    public class Character
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

        public bool UseAbility(string owner, AbilityInfo info, Game game)
        {
            return _ability.UseAbility(owner, info, game);
        }

        public void OnReveal(string owner, Game game)
        {
            _revealAbility.OnReveal(owner, game);
        }
    }
}