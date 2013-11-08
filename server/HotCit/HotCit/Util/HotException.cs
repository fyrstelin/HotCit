using System;

namespace HotCit.Util
{
    public class HotCitException : Exception
    {
        public HotCitException(ExceptionType type, string msg = "")
        {
            switch (type) {
                case ExceptionType.BadAction: throw new BadActionException(msg);
                case ExceptionType.IllegalInput: throw new IllegalInputException(msg);
                case ExceptionType.IllegalState: throw new IllegalStateException(msg);
                case ExceptionType.Impossible: throw new ImpossibleException(msg);
                case ExceptionType.NotEnoughGold: throw new NotEnoughGoldException(msg);
                case ExceptionType.NotFound: throw new NotFoundException(msg);
                case ExceptionType.Timeout: throw new TimeoutException(msg);
            }
        }
    }

    public class TimeoutException : Exception
    {
        public TimeoutException(string msg) : base(msg) { }
    }

    public class IllegalInputException : Exception
    {
        public IllegalInputException(string msg) : base(msg) { }
    }

    public class BadActionException : Exception
    {
        public BadActionException(string msg) : base(msg) { }
    }

    public class IllegalStateException : Exception
    {
        public IllegalStateException(string msg) : base(msg) { }
    }

    public class NotFoundException : Exception
    {
        public NotFoundException(string msg) : base(msg) { }
    }

    public class NotEnoughGoldException : Exception
    {
        public NotEnoughGoldException(string msg) : base(msg) { }
    }

    public class ImpossibleException : Exception
    {
        public ImpossibleException(string msg) : base(msg) { }
    }

    public enum ExceptionType
    {
        Timeout,
        IllegalInput,
        BadAction,
        IllegalState,
        NotFound,
        NotEnoughGold,
        Impossible
    }
}