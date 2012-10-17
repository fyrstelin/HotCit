using System.Linq;

namespace HotCit
{
    public delegate bool OnSelect(Game game, string pid, string[] cards);

    public delegate void AfterSelect();

    public interface ISelectStrategy
    {
        bool OnSelect(Game game, string pid, string[] cards);


        AfterSelect AfterSelect();

        Option GetOption();
    }

    public class StandardSelectStrategy : ISelectStrategy
    {
        private readonly Option _option;
        private readonly OnSelect _onSelect;
        private readonly AfterSelect _afterSelect;

        public StandardSelectStrategy(Option option, OnSelect onSelect, AfterSelect afterSelect = null)
        {
            _option = option;
            _onSelect = onSelect;
            if (afterSelect == null)
                afterSelect = Dummy;
            _afterSelect = afterSelect;
        }

        private static void Dummy()
        {
            
        }

        public bool OnSelect(Game game, string pid, string[] cards)
        {
            return
                cards.All(c1 => _option.Choices.Any(c2 => c1 == c2)) &&
                (_option.Amount == null || cards.Length == _option.Amount) &&
                _onSelect(game, pid, cards);
        }

        public AfterSelect AfterSelect()
        {
            return _afterSelect;
        }

        public Option GetOption()
        {
            return _option;
        }
    }
}