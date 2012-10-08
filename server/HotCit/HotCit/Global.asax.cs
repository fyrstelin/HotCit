using System;
using Funq;
using ServiceStack.WebHost.Endpoints;

namespace HotCit
{
    public class Global : System.Web.HttpApplication
    {
        public class ServerHost : AppHostBase
        {
            public ServerHost () : base("HotCit Web Services", typeof(LobbyServer).Assembly)
            {
            
            }

            public override void Configure(Container container)
            {
                container.RegisterAutoWired<LobbyServer>();

                Routes.
                    Add<LobbyRequest>("/lobby/").
                    Add<LobbyRequest>("/lobby/{GameId}/").
                    Add<JoinRequest>("/lobby/{GameId}/users/").
                    Add<ReadyRequest>("/lobby/{GameId}/ready/");
            }
        }
            

        void Application_Start(object sender, EventArgs e)
        {
            new ServerHost().Init();
        }
    }
}
