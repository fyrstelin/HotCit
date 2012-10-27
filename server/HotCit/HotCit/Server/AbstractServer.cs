using System;
using System.Net;
using HotCit.Lobby;
using HotCit.Util;
using ServiceStack.Common.Web;
using ServiceStack.ServiceInterface;

namespace HotCit.Server
{
    public abstract class AbstractServer<T> : RestServiceBase<T>
    {
        protected readonly GameSetupRepository SetupRepository = GameSetupRepository.GetInstance();
        protected readonly GameRepository GameRepository = GameRepository.GetInstance();
        protected readonly Resources Resources = Resources.GetInstance();

        protected string User
        {
            get
            {
                var user = Request.Headers[HttpHeaders.Authorization];
                if (user == null) throw new HttpError(HttpStatusCode.Unauthorized, "Please provide credentials");
                return user;
            }
        }

        protected GameSetup GetGameSetup(string id)
        {
            var setup = SetupRepository.GetSetup(id);
            if (setup == null) throw new HttpError(HttpStatusCode.NotFound, "Game " + id + " not found");
            return setup;
        }

        protected Game GetGame(string id)
        {
            var game = GameRepository.GetGame(id);
            if (game == null) throw new HttpError(HttpStatusCode.NotFound, "Game " + id + " not found");
            return game;
        }

        protected override object HandleException(T request, Exception ex)
        {
            var e = ex as HotCitException;
            if (e == null) return HttpError(HttpStatusCode.InternalServerError, ex);
            var code = HttpStatusCode.InternalServerError;
            switch (e.Type)
            {
                case ExceptionType.Timeout:
                    code = HttpStatusCode.RequestTimeout;
                    break;
                case ExceptionType.IllegalInput:
                    code = HttpStatusCode.BadRequest;
                    break;
                case ExceptionType.BadAction:
                    code = HttpStatusCode.Forbidden;
                    break;
                case ExceptionType.NotFound:
                    code = HttpStatusCode.NotFound;
                    break;
            }
            return HttpError(code, e.Mes);
        }

        private static object HttpError(HttpStatusCode code, object o)
        {
            return new HttpError(o, code, "", "");
        }
    }
}