using System.Collections.Generic;
using System.Net;
using HotCit.Data;
using HotCit.Lobby;
using HotCit.Strategies;
using ServiceStack.Common.Web;
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
            try
            {
                return new GameResponse(GetGame(id), User);
            } catch (HttpError)
            {
                return new GameResponse(GetGame(id));
            }
        }

        public override object OnPut(GameRequest request)
        {
            var game = GetGame(request.GameId);

            if (request.Select != null)
            {
                game.Select(User, request.Select);
                return new HttpResult(HttpStatusCode.NoContent, "");
            }

            if (request.Action != null)
            {
                switch (request.Action)
                {
                    case Action.EndTurn:
                        game.EndTurn(User);
                        return new HttpResult(HttpStatusCode.NoContent, "");
                    case Action.TakeGold:
                        game.TakeGold(User);
                        return new HttpResult(HttpStatusCode.NoContent, "");
                    case Action.DrawDistricts:
                        game.DrawDistricts(User);
                        return new HttpResult(HttpStatusCode.NoContent, "");
                }
            }

            if (request.Build != null)
            {
                game.BuildDistrict(User, request.Build);
                return new HttpResult(HttpStatusCode.NoContent, "");
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

    public class SecretServer : AbstractServer<SecretRequest>
    {
        public override object OnGet(SecretRequest request)
        {
            return GetGame(request.GameId).GetOptions(User);
        }
    }
}