using System;

namespace HotCit.Util
{
    public class HotCitException : Exception
    {
        public string Mes { get; private set; }
        public ExceptionType Type { get; private set; }

        public HotCitException(ExceptionType type, string mes = "")
        {
            Mes = mes;
            Type = type;
        }
    }

    public enum ExceptionType
    {
        Timeout, IllegalInput,
        BadAction,
        IllegalState,
        NotFound,
        NotEnoughGold,
        Impossible
    }
}