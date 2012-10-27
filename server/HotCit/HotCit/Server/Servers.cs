using System;
using System.Collections.Generic;
using System.Net;
using HotCit.Data;
using ServiceStack.Common.Web;
using ServiceStack.ServiceInterface;
using Action = HotCit.Data.Action;

namespace HotCit.Server
{
    public class LobbyServer : AbstractServer<LobbyRequest>
    {
        public override object OnGet(LobbyRequest request)
        {
            var id = request.GameId;
            if (id == null)
                return SetupRepository.GameSetups;
            return GetGameSetup(id);
        }

        public override object OnPost(LobbyRequest request)
        {
            var id = request.GameId;
            var minPlayers = request.MinPlayers;
            var maxPlayers = request.MaxPlayers;
            var password = request.Password;
            var user = User;

            ICharacterDiscardStrategy discardStrategy;
            switch (request.Discard)
            {
                case "fixed":
                    discardStrategy = new FixedDiscardStrategy
                    {
                        CharacterNumber = 7 //discard architect each round
                    };
                    break;

                //case "random":
                default:
                    discardStrategy = new RandomDiscardStrategy();
                    break;
            }

            var setup = new GameSetup(minPlayers, maxPlayers, password, discardStrategy);
            if (SetupRepository.AddGameSetup(id, setup))
            {
                setup.Join(user);
                return new HttpResult(HttpStatusCode.Created, "");
            }
            return new HttpError(HttpStatusCode.Conflict, "Game already exists");
        }
    }

    public class JoinServer : AbstractServer<JoinRequest>
    {
        public override object OnGet(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");
            return GetGameSetup(id);
        }

        public override object OnPut(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");
            var fac = GetGameSetup(id);

            if (fac.Join(User))
                return new HttpResult(HttpStatusCode.NoContent, "");

            return new HttpError(HttpStatusCode.Conflict, "Game is full");
        }

        public override object OnDelete(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

            if (GetGameSetup(id).Leave(User))
                return new HttpResult(HttpStatusCode.NoContent, "");

            return new HttpError(HttpStatusCode.NotModified, User + " is not part of the game");
        }
    }

    public class ReadyServer : AbstractServer<ReadyRequest>
    {
        public override object OnPut(ReadyRequest request)
        {
            var id = request.GameId;
            if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

            var fac = GetGameSetup(id);

            if (fac.SetReady(User, true)) //everyone is ready
            {
                var game = new Game(fac);
                GameRepository.AddGame(id, game);
                SetupRepository.RemoveGameFactory(id);
            }
            return new HttpResult(HttpStatusCode.NoContent, "");
        }

        public override object OnDelete(ReadyRequest request)
        {
            var id = request.GameId;
            if (id == null) return new HttpError(HttpStatusCode.BadRequest, "Bad Request");

            var fac = GetGameSetup(id);

            if (fac.SetReady(User, false)) //everyone is ready
            {
                var game = new Game(fac);
                GameRepository.AddGame(id, game);
                SetupRepository.RemoveGameFactory(id);
            }
            return new HttpResult(HttpStatusCode.NoContent, "");
        }

    }

    public class GameServer : AbstractServer<GameRequest>
    {
        public override object OnGet(GameRequest request)
        {
            var id = request.GameId;
            if (id == null) return GameRepository.Games;
            var game = GetGame(id);
            switch (request.GameInfo)
            {
                case GameInfo.State:
                    return game.State;
                case GameInfo.Players:
                    if (request.Id == null)
                        return game.Players;
                    return game.GetPlayerByUsername(request.Id);
                case GameInfo.FaceUp:
                    return game.FaceupCharacters;
                case GameInfo.Updates:
                    if (request.Id == null) throw new HttpError(HttpStatusCode.BadRequest, "");
                    return GameRepository.GetUpdates(id, Convert.ToInt32(request.Id));
                case GameInfo.MyOptions:
                    return game.GetOptions(User);
                case GameInfo.MyHand:
                    return game.GetHand(User);
            }
            return game;
        }

        public override object OnPut(GameRequest request)
        {
            var game = GetGame(request.GameId);

            if (request.Select != null)
            {
                var select = request.Select[0];

                if (game.Select(User, select))
                    return new HttpResult(HttpStatusCode.NoContent, "");
                return new HttpError(HttpStatusCode.Forbidden, "It is not your turn");
            }

            if (request.Action != null)
            {
                switch (request.Action)
                {
                    case Action.EndTurn:
                        if (game.EndTurn(User))
                            return new HttpResult(HttpStatusCode.NoContent, "");
                        return new HttpError(HttpStatusCode.Forbidden, "It is not your turn");
                    case Action.TakeGold:
                        if (game.TakeGold(User))
                            return new HttpResult(HttpStatusCode.NoContent, "");
                        return new HttpError(HttpStatusCode.Forbidden, "It is not your turn");
                    case Action.DrawDistricts:
                        if (game.DrawDistricts(User))
                            return new HttpResult(HttpStatusCode.NoContent, "");
                        return new HttpError(HttpStatusCode.Forbidden, "It is not your turn");

                }
            }

            if (request.Build != null)
            {
                if (game.BuildDistrict(User, request.Build))
                    return new HttpResult(HttpStatusCode.NoContent, "");
                return new HttpError(HttpStatusCode.Forbidden, "It is not your turn");
            }

            if (request.Ability != null)
            {
                game.UseAbility(User, request.Ability);
                return new HttpResult(HttpStatusCode.NoContent, "");
            }

            return new HttpError(HttpStatusCode.BadRequest, "");
        }
    }

    public class ResourceServer : AbstractServer<ResourceRequest>
    {
        public override object OnGet(ResourceRequest request)
        {
            var type = request.ResourceType;
            var id = request.ResourceId;
            var all = id == null;
            switch (type)
            {
                case ResourceType.All:
                    var map = new Dictionary<ResourceType, object>();
                    map[ResourceType.Characters] = Resources.Characters;
                    map[ResourceType.Districts] = Resources.Districts;
                    return map;
                case ResourceType.Characters:
                    if (all)
                        return Resources.Characters;
                    var ch = Resources.GetCharacter(id);
                    if (ch == null) return HttpError.NotFound("Character " + id + " not found");
                    return ch;
                case ResourceType.Districts:
                    if (all)
                        return Resources.Districts;
                    var di = Resources.GetDistrict(id);
                    if (di == null) return HttpError.NotFound("District " + id + " not found");
                    return di;
                case ResourceType.Images:
                    if (all) return new HttpError(HttpStatusCode.BadRequest, "");
                    var img = Resources.GetImage(id, request.Dpi);
                    if (img == null) return HttpError.NotFound("Image " + id + " not found");
                    return new HttpResult(img, "image/png");
            }
            return null;
        }
    }

    public class TestServer : RestServiceBase<DummyRequest>
    {
        public override object OnGet(DummyRequest request)
        {
            throw new HttpError(HttpStatusCode.MethodNotAllowed, "Dummy not found");
        }

        protected override object HandleException(DummyRequest request, Exception ex)
        {
            return new HttpError("Monkey is everybody", HttpStatusCode.Conflict, "Dummy not found", "");
        }
    }

    public class DummyRequest
    {

    }
}