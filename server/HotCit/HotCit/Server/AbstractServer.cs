using System;
using System.Net;
using HotCit.Data;
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
        protected readonly HttpResult Succeeded = new HttpResult(HttpStatusCode.NoContent, "");

        protected string User
        {
            get
            {
                var user = Request.Headers[HttpHeaders.Authorization];
                if (user == null) throw new HttpError(HttpStatusCode.Unauthorized, "Please provide credentials");
                return user;
            }
        }

        protected int IfRange
        {
            get {
                var res = Request.Headers["If-Range"];
                return res == null ? -1 : Convert.ToInt32(res);
            }
        }

        private int ETag
        {
            set
            {
                Response.AddHeader(HttpHeaders.ETag, value + "");
            }
        }

        protected GameSetup GetGameSetup(string id)
        {
            var setup = SetupRepository.GetSetup(id);
            if (setup == null) throw new HotCitException(ExceptionType.NotFound, "Game " + id + " not found");
            return setup;
        }

        protected GameResponse GetPartialGame(string id, int lastSeenGame)
        {
            var pair = GameRepository.GetPartialGame(id, lastSeenGame);
            ETag = pair.Key;
            return pair.Value;
        }

        protected Game GetGame(string id)
        {
            return GameRepository.GetGame(id);
        }

        protected override object HandleException(T request, Exception ex)
        {
            var e = ex as HotCitException;
            var code = HttpStatusCode.InternalServerError;
            string message;
            if (e != null)
            {
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
                    case ExceptionType.Impossible:
                        code = HttpStatusCode.Conflict;
                        break;
                }
                message = e.Mes;
            } else
            {
                var er = ex as HttpError;
                if (er != null)
                {
                    code = er.StatusCode;
                }
                message = ex.Message;
            }
            return HttpError(code, message);
        }

        private static object HttpError(HttpStatusCode code, object o)
        {
            return new HttpError(o, code, "", "");
        }

    }
}