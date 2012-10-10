using System.Net;
using ServiceStack.Common.Web;
using ServiceStack.ServiceInterface;

namespace HotCit
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

    }
}