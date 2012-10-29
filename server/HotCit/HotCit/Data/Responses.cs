using System.Collections.Generic;
using System.Linq;

namespace HotCit.Data
{
    public class GameResponse
    {
        public IEnumerable<PlayerResponse> Players { get; set; }
        public string King { get; set; }
        public string PlayerInTurn { get; set; }
        public Turn? Turn { get; set; }
        public Step? Step { get; set; }
        public int? Round { get; set; }
        public IEnumerable<string> FaceUpCharacters { get; set; }
        public SecretResponse Secret { get; set; }

        public GameResponse(Game game, string user = null)
        {
            Players = game.Players.Select(p => new PlayerResponse(p));
            King = game.King.Username;
            FaceUpCharacters = game.FaceupCharacters.Select(c => c.Name);
            PlayerInTurn = game.PlayerInTurn.Username;
            Turn = game.Turn;
            Step = game.Step;
            Round = game.Round;
            if (user != null)
                Secret = new SecretResponse(game, user);
        }

        public GameResponse()
        {
        }
    }

    public class PlayerResponse
    {
        public string Username { get; set; }
        public IEnumerable<string> City { get; set; }
        public int? NumberOfCards { get; set; }
        public int? Points { get; set; }
        public int? Gold { get; set; }
        public IEnumerable<string> Characters { get; set; }

        public PlayerResponse(Player player)
        {
            Username = player.Username;
            City = player.City.Select(d => d.Title);
            NumberOfCards = player.Hand.Count;
            Points = player.City.Sum(d => d.Value); //TODO more complex
            Gold = player.Gold;
            Characters = player.Characters.Select(c => c.Name);
        }

        public PlayerResponse()
        {
        }
    }

    public class SecretResponse
    {
        public IEnumerable<Option> Options { get; set; }
        public IEnumerable<District> Hand { get; set; }
        public IEnumerable<Character> Characters { get; set; } 

        public SecretResponse(Game game, string user)
        {
            Options = game.GetOptions(user);
            Hand = game.GetPlayerByUsername(user).Hand;
            Characters = game.GetPlayerByUsername(user).HiddenCharacters;
        }
    }

}