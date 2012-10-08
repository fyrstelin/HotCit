using System;
using System.Net;
using HotCit;
using ServiceStack.Common.Web;

namespace HotCit
{
    public class LobbyServer : AbstractServer<LobbyRequest>
    {
        public override object OnGet(LobbyRequest request)
        {
            try
            {
                var id = request.GameId;
                if (id == null)
                    return FactoryRepository.GameFactories;
                return GetFactory(id);
            }
            catch (HttpError e)
            {
                return e;
            }
        }

        public override object OnPost(LobbyRequest request)
        {
            try {
                var id = request.GameId;
                var minPlayers = request.MinPlayers;
                var maxPlayers = request.MaxPlayers;
                var password = request.Password;
                var user = User;

                var gameFactory = new UserGameFactory(minPlayers, maxPlayers, password);
                if (FactoryRepository.AddGameFactory(id, gameFactory))
                {
                    gameFactory.Join(user);
                    return new HttpResult(HttpStatusCode.Created, "");
                }
                return new HttpError(HttpStatusCode.Conflict, "Game already exists");
            }
            catch (HttpError e)
            {
                return e;
            }
        }
    }

    public class JoinServer : AbstractServer<JoinRequest>
    {
        public override object OnGet(JoinRequest request)
        {
            try {
                var id = request.GameId;
                if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");
                var fac = GetFactory(id);

                return fac.GetPlayers();
            }
            catch (HttpError e)
            {
                return e;
            }
        }

        public override object OnPut(JoinRequest request)
        {
            try {
                var id = request.GameId;
                if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");
                var fac = GetFactory(id);

                if (fac.Join(User))
                    return new HttpResult(HttpStatusCode.NoContent, "");

                return new HttpError(HttpStatusCode.Conflict, "Game is full");
            }
            catch (HttpError e)
            {
                return e;
            }
        }

        public override object OnDelete(JoinRequest request)
        {
            try {
                var id = request.GameId;
                if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

                if (GetFactory(id).Leave(User))
                    return new HttpResult(HttpStatusCode.NoContent, "");

                return new HttpError(HttpStatusCode.NotModified, User + " is not part of the game");
            }
            catch (HttpError e)
            {
                return e;
            }
        }
    }

    public class ReadyServer : AbstractServer<ReadyRequest>
    {
        public override object OnPut(ReadyRequest request)
        {
            try {
                var id = request.GameId;
                if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

                return GetFactory(id).SetReady(User, true) ?
                    new HttpResult(HttpStatusCode.NotImplemented, "Everyone is ready") :
                    new HttpResult(HttpStatusCode.NoContent, "");
            }
            catch (HttpError e)
            {
                return e;
            }
        }

        public override object OnDelete(ReadyRequest request)
        {
            try {
                var id = request.GameId;
                if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

                var fac = GetFactory(id);

                if (fac.SetReady(User, false)) //everyone is ready
                {
                    var game = new Game(fac);
                    GameRepository.AddGame(id, game);
                    FactoryRepository.RemoveGameFactory(id);
                }
                return new HttpResult(HttpStatusCode.NoContent, "");
            }
            catch (HttpError e)
            {
                return e;
            }
        }
        
    }

}