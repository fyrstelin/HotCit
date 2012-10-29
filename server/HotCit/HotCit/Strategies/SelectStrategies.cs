using System.Linq;
using HotCit.Data;
using HotCit.Util;

namespace HotCit.Strategies
{
    public delegate void OnSelect(Game game, string pid, string[] cards);

    public delegate void AfterSelect();

    public interface ISelectStrategy
    {
        void OnSelect(Game game, string pid, string[] cards);


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
                afterSelect = () => { };
            _afterSelect = afterSelect;
        }

        public void OnSelect(Game game, string pid, string[] cards)
        {
            var c = cards.FirstOrDefault(c1 => _option.Choices.All(c2 => c1 != c2));

            if (c!=null) throw new HotCitException(ExceptionType.BadAction, "You did not have the option to select " + c);

            if (_option.Amount != null && cards.Length != _option.Amount) throw new HotCitException(ExceptionType.BadAction, "You have selected " + cards.Length + " cards, but should select " + _option.Amount + " cards");
            
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