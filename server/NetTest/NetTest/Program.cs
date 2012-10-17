using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using Microsoft.SPOT;
using Microsoft.SPOT.Input;
using Microsoft.SPOT.Presentation;
using Microsoft.SPOT.Presentation.Controls;
using Networking;

namespace NetTest
{
    public class Program : Microsoft.SPOT.Application
    {
        private const string dottedServerIPAddress = "http://baren.dk";
        private const int port = 80;

        public static void Main()
        {
            using (Socket clientSocket = new Socket(AddressFamily.InterNetwork,
                                                    SocketType.Stream,
                                                    ProtocolType.))
            {
                // Addressing
                IPHostEntry entry = Dns.GetHostEntry(dottedServerIPAddress);
                IPAddress ipAddress = entry.AddressList[0];
                IPEndPoint serverEndPoint = new IPEndPoint(ipAddress, port);
                // Connecting
                Debug.Print("Connecting to server " + serverEndPoint + ".");
                clientSocket.Connect(serverEndPoint);
                Debug.Print("Connected to server.");
                // Sending
                byte[] messageBytes = Encoding.UTF8.GetBytes("GET / HTTP/1.1");
                clientSocket.Send(messageBytes);

                var buf = new byte[16*1024];
                while (true)
                {
                    clientSocket.Receive(buf);
                    var cs = Encoding.UTF8.GetChars(buf);
                    var s = new string(cs);
                    Debug.Print(s);
                }
            }// the socket will be closed here
        }
    }
}
