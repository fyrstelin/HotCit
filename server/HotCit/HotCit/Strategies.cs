using System;
using System.Collections.Generic;
using System.Linq;

namespace HotCit
{
    public interface ICharacterDiscardStrategy
    {
        Character DiscardCharacter(IList<Character> pile);
    }

    public class FixedDiscardStrategy : ICharacterDiscardStrategy
    {
        public int CharacterNumber { get; set; }

        public Character DiscardCharacter(IList<Character> pile)
        {
            if (CharacterNumber == 0) CharacterNumber = 1;
            return pile.FirstOrDefault(c => c.No == CharacterNumber);
        }
    }

    public class RandomDiscardStrategy : ICharacterDiscardStrategy
    {
        public Character DiscardCharacter(IList<Character> pile)
        {
            return pile[_random.Next(pile.Count)];
        }

        private readonly Random _random = new Random();
    }

}