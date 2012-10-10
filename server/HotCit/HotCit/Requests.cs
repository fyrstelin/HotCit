namespace HotCit
{
    public class LobbyRequest
    {
        public string GameId { get; set; }
        public string Password { get; set; }
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
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
        public string[] Select { get; set; }
        public Action? Action { get; set; }
    }

    public class OptionsRequest : GameRequest
    {
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
        EndTurn
    }
}