using System;
using System.Collections.Generic;
using System.Linq;
using HotCit.Data;

namespace HotCit.Strategies
{
    public interface ICharacterDiscardStrategy
    {
        Character DiscardCharacter(IList<Character> pile);
        Character FaceupCharacter(IList<Character> pile);
    }

    public class FixedDiscardStrategy : ICharacterDiscardStrategy
    {
        public int? CharacterNumber { get; set; }
        public int? FirstFaceUp { get; set; }
        public int? SecondFaceUp { get; set; }

        public Character DiscardCharacter(IList<Character> pile)
        {
            if (CharacterNumber == null) CharacterNumber = 1;
            return pile.FirstOrDefault(c => c.No == CharacterNumber);
        }

        public Character FaceupCharacter(IList<Character> pile)
        {
            if (FirstFaceUp == null) FirstFaceUp = 2;
            if (SecondFaceUp == null) SecondFaceUp = 3;
            return pile.FirstOrDefault(c => c.No == FirstFaceUp) ?? pile.FirstOrDefault(c => c.No == SecondFaceUp);
        }
    }

    public class RandomDiscardStrategy : ICharacterDiscardStrategy
    {
        public Character DiscardCharacter(IList<Character> pile)
        {
            return pile[_random.Next(pile.Count)];
        }

        public Character FaceupCharacter(IList<Character> pile)
        {

            var temp = pile.Where(ch => ch.No != 4).ToList();

            return temp[_random.Next(temp.Count - 1)];
        }

        private readonly Random _random = new Random();
    }

}