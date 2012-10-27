using HotCit.Strategies;
using HotCit.Util;

namespace HotCit.Data
{
    public class LobbyRequest
    {
        public string GameId { get; set; }
        public string Password { get; set; }
        public int? MinPlayers { get; set; }
        public int? MaxPlayers { get; set; }

        public string Discard { get; set; }
    }

    public class JoinRequest
    {
        public string GameId { get; set; }
    }

    public class ReadyRequest
    {
        public string GameId { get; set; }
    }

    public class GameRequest
    {
        public string GameId { get; set; }
        public int? LastSeenUpdate { get; set; }

        //for put requests
        public string[] Select { get; set; }
        public string Build { get; set; }
        public Action? Action { get; set; }
        public AbilityInfo Ability { get; set; }

    }

    public enum GameInfo
    {
        State, Players, FaceUp, Updates, MyHand, MyOptions
    }

    public class SecretRequest : GameRequest
    {
        public Secret? Secret { get; set; }
    }

    public enum Secret
    {
        Options, Hand
    }


    public class ResourceRequest
    {

        public string ResourceId { get; set; }
        public ResourceType ResourceType { get; set; }
        public ImageQuality Dpi { get; set; }
    }


    public enum ResourceType
    {
        All, Characters, Districts, Images
    }

    public enum Action
    {
        EndTurn, TakeGold, DrawDistricts
    }
}