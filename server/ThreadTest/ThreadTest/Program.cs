using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace ThreadTest
{
    class Program
    {
        private static readonly IList<string> Updates = new List<string>(); 

        private static void GetUpdate(object id)
        {
            Console.WriteLine("Thread " + id + " started");
            lock (Updates)
            {
                Console.WriteLine("Thread " + id + " has lock");
                while (Updates.Count == 0)
                {
                    Console.WriteLine("Thread " + id + " waits");
                    Monitor.Wait(Updates);
                    Console.WriteLine("Thread " + id + " continous");
                }
                var update = Updates.First();
                Console.WriteLine("Thread " + id + " releases lock, with update " + update); 
            }
        }

        private static void AddUpdate(string id)
        {
            Console.WriteLine("Adding update " + id);
            lock(Updates)
            {
                Updates.Add(id);
                Monitor.PulseAll(Updates);
                Console.WriteLine("PulseAll called");
            }
        }

        static void Main(string[] args)
        {
            for (var i = 0; i < 10 ; i++)
                new Thread(GetUpdate).Start(i);

            Thread.Sleep(1000);
            AddUpdate("foo");
            Console.Read();
        }
    }
}
