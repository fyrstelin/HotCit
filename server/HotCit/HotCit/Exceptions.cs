using System;

namespace HotCit
{
    public class HotCitException : Exception
    {
        public readonly string Mes;

        public HotCitException(string mes)
        {
            Mes = mes;
        }
    }

    public class IllegalAction : HotCitException
    {
        public IllegalAction(string mes) : base(mes)
        {
            
        }
    }

    public class IllegalRequest : HotCitException
    {
        public IllegalRequest(string mes = "Illegal Request") : base(mes)
        {
            
        }
    }

}