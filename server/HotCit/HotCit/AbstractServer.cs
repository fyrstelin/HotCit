using System.Net;
using ServiceStack.Common.Web;
using ServiceStack.ServiceInterface;

namespace HotCit
{
    public abstract class AbstractServer<T> : RestServiceBase<T>
    {
        protected readonly GameFactoryRepository FactoryRepository = GameFactoryRepository.GetInstance();
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

        protected UserGameFactory GetFactory(string id)
        {
            var fac = FactoryRepository.GetFactory(id);
            if (fac == null) throw new HttpError(HttpStatusCode.NotFound, "Game " + id + " not found");
            return fac;
        }

    }
}