using System;
using System.Collections.Generic;
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

                var fac = GetFactory(id);

                if (fac.SetReady(User, true)) //everyone is ready
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

    public class GameServer : AbstractServer<GameRequest>
    {
        public override object OnGet(GameRequest request)
        {
            try
            {
                var id = request.GameId;
                if (id == null) return GameRepository.Games;
                return GameRepository.GetGame(id);
            }
            catch (HttpError e)
            {
                return e;
            }
        }
    }

    public class ResourceServer : AbstractServer<ResourceRequest>
    {
        public override object OnGet(ResourceRequest request)
        {
            var type = request.ResourceType;
            var id = request.ResourceId;
            var all = id == null;
            switch (type) {
                case ResourceType.all:
                    var map = new Dictionary<ResourceType, object>();
                    map[ResourceType.characters] = Resources.Characters;
                    map[ResourceType.districts] = Resources.Districts;
                    return map;
                case ResourceType.characters:
                    if (all)
                        return Resources.Characters;
                    var ch = Resources.GetCharacter(id);
                    if (ch == null) return HttpError.NotFound("Character " + id + " not found");
                    return ch;
                case ResourceType.districts:
                    if (all)
                        return Resources.Districts;
                    var di = Resources.GetDistrict(id);
                    if (di == null) return HttpError.NotFound("District " + id + " not found");
                    return di;
                case ResourceType.images:
                    if (all) return new HttpError(HttpStatusCode.BadRequest, "");
                    var img = Resources.GetImage(id, request.Dpi);
                    if (img == null) return HttpError.NotFound("Image " + id + " not found");
                    return new HttpResult(img, "image/png");;
            }
            return null;
        }
    }

}