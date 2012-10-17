using System.Collections.Generic;

namespace HotCit
{

    public class District
    {
        public string Title { get; set; }
        public int Price { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
        public string Text { get; set; }
    }

    public class Option
    {
        public OptionType Type { get; set; }
        public string Message { get; set; }
        public IEnumerable<string> Choices { get; set; }
        public string Source { get; set; }
        public int? Amount { get; set; }
    }

    public enum OptionType
    {
        Select, TakeAction, UseAbility, BuildDistrict, EndTurn
    }

    public class GameStateVector
    {
        public string Description { get; set; }
        public int Round { get; set; }
        public Step Step { get; set; }
        public Turn? Turn { get; set; }
        public bool? AbilityUsed { get; set; }
        public string PlayerInTurn { get; set; }
    }

    public enum Step
    {
        RemoveCharacters, ChooseCharacter, PlayerTurns, EndOfRound
    }

    public enum Turn
    {
        TakeAnAction, BuildADistrict
    }
}