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

    public class SecretRequest
    {
        public string GameId { get; set; }
        public What What { get; set; }
    }

    public enum What
    {
        Options, Hand
    }

    public enum Action
    {
        EndTurn, TakeGold, DrawDistricts
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

}