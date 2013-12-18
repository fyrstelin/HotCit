using Funq;
using HotCit.Data;
using HotCit.Server;
using HotCit.Util;
using ServiceStack.WebHost.Endpoints;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace HotCit
{
    class Program
    {
        public class ServerHost : AppHostHttpListenerBase
        {
            public ServerHost()
                : base("HotCit Web Services", typeof(LobbyServer).Assembly)
            {

            }

            public override void Configure(Container container)
            {
                SetConfig(new EndpointHostConfig
                    {
                        GlobalResponseHeaders =
                            {
                                {"Access-Control-Allow-Origin", "*"},
                                {"Access-Control-Allow-Methods", "*"},
                                {"Access-Control-Allow-Headers", "*"}
                            },
                        DebugMode = true,
                        MapExceptionToStatusCode =
                        {
                            { typeof(HotCit.Util.TimeoutException), 408},
                            { typeof(IllegalInputException), 400},
                            { typeof(BadActionException), 403},
                            { typeof(NotFoundException), 404},
                            { typeof(ImpossibleException), 409},
                            { typeof(NotEnoughGoldException), 402}
                        }
                    });
                Routes.
                    Add<LobbyRequest>("/lobby/").
                    Add<LobbyRequest>("/lobby/{GameId}/").

                    Add<JoinRequest>("/lobby/{GameId}/users/").

                    Add<ReadyRequest>("/lobby/{GameId}/ready/").

                    Add<GameRequest>("/games/").
                    Add<GameRequest>("/games/{GameId}/").

                    Add<SecretRequest>("/games/{GameId}/{What}/").
                    Add<ResourceRequest>("/resources/").
                    Add<ResourceRequest>("/resources/{ResourceType}/").
                    Add<ResourceRequest>("/resources/{ResourceType}/{ResourceId}/");
            }
        }

        static void Main(string[] args)
        {
            ServicePointManager.DefaultConnectionLimit = 32;
            var app = new ServerHost();
            var addr = "http://*:8080/";
            app.Init();
            app.Start(addr);
            Console.WriteLine("AppHost Created at {0}, listening on {1}", DateTime.Now, addr);

            Console.WriteLine("CTRL + C to exit");
            Thread.Sleep(Timeout.Infinite);
        }
    }
}
