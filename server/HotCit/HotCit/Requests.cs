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
}