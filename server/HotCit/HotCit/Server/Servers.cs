using System.Collections.Generic;
using System.Linq;
using System.Net;
using HotCit.Data;
using HotCit.Lobby;
using HotCit.Strategies;
using HotCit.Util;
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
            return Succeeded;
        }
    }

    public class JoinServer : AbstractServer<JoinRequest>
    {
        public override object OnGet(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);
            return GetGameSetup(id);
        }

        public override object OnPut(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);
            var fac = GetGameSetup(id);

            fac.Join(User);
            return Succeeded;
        }

        public override object OnDelete(JoinRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);

            GetGameSetup(id).Leave(User);
            return Succeeded;
        }
    }

    public class ReadyServer : AbstractServer<ReadyRequest>
    {
        public override object OnPut(ReadyRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);

            var fac = GetGameSetup(id);

            if (fac.SetReady(User, true)) //everyone is ready
            {
                var game = new Game(fac);
                GameRepository.AddGame(id, game);
                SetupRepository.RemoveGameFactory(id);
            }
            return Succeeded;
        }

        public override object OnDelete(ReadyRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);

            var fac = GetGameSetup(id);

            fac.SetReady(User, false);
            return Succeeded;
        }

    }

    public class GameServer : AbstractServer<GameRequest>
    {
        public override object OnGet(GameRequest request)
        {
            var id = request.GameId;
            if (id == null) return GameRepository.Games;
            var statusCode = IfRange == -1 ? HttpStatusCode.OK : HttpStatusCode.PartialContent;
            return new HttpResult(GetPartialGame(request.GameId, IfRange), statusCode);
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
                        return Succeeded;
                    case Action.TakeGold:
                        game.TakeGold(User);
                        return Succeeded;
                    case Action.DrawDistricts:
                        game.DrawDistricts(User);
                        return Succeeded;
                }
            }

            if (request.Build != null)
            {
                game.BuildDistrict(User, request.Build);
                return Succeeded;
            }

            if (request.Ability != null)
            {
                game.UseAbility(User, request.Ability);
                return Succeeded;
            }

            throw new HotCitException(ExceptionType.IllegalInput);
        }

        public override object OnDelete(GameRequest request)
        {
            var id = request.GameId;
            if (id == null) throw new HotCitException(ExceptionType.IllegalInput);
            if (GetGame(id).Players.Any(p => p.Username == User))
            {
                GameRepository.RemoveGame(id);
                return Succeeded;
            }
            throw new HotCitException(ExceptionType.BadAction, "You are not a part of the game, and therefore cannot delete it");
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
            throw new HotCitException(ExceptionType.IllegalInput);
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