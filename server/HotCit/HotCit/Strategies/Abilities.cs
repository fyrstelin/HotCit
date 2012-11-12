using System.Collections.Generic;
using System.Linq;
using HotCit.Data;
using HotCit.Util;

namespace HotCit.Strategies
{
    public class AbilityInfo
    {
        public string Target { get; set; }
        public string District { get; set; }
        public string Source { get; set; }
    }

    public interface IAbility
    {
        void Reset();

        bool UseAbility(Player owner, AbilityInfo info, Game game);

        IEnumerable<Option> GetOptions(Game game);
        bool Used { get; }
    }

    public abstract class AbstractAbility : IAbility
    {
        public bool UseAbility(Player owner, AbilityInfo info, Game game)
        {
            if (Used) return false;
            if (!CheckInfo(info)) throw new HotCitException(ExceptionType.IllegalInput);
            UseUnusedAbility(owner, info, game);
            Used = true;
            return true;
        }

        public abstract IEnumerable<Option> GetOptions(Game game);
        public bool Used { get; set; }

        protected abstract void UseUnusedAbility(Player owner, AbilityInfo info, Game game);
        protected abstract bool CheckInfo(AbilityInfo info);

        public void Reset()
        {
            Used = false;
        }
    }

    public class NullAbility : AbstractAbility
    {
        public override IEnumerable<Option> GetOptions(Game game)
        {
            return new List<Option>();
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return true;
        }
    }

    public class AssassinAbility : AbstractAbility
    {
        private const string Description = "Choose a character to assasin";

        public override IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            if (!Used)
                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = Description,
                    Choices = game.Characters.Where(c =>
                        c.No > 1 &&
                        !game.FaceupCharacters.Contains(c)).Select(c => c.Name)
                });
            return res;
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            var target = game.Characters.FirstOrDefault(c => c.Name == info.Target);
            if (target == null) throw new HotCitException(ExceptionType.IllegalInput, info.Target + " is not a character in the game");
            target.Dead = true;
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target != null && info.District == null;
        }
    }

    public class ThiefAbility : AbstractAbility
    {
        private const string Description = "Choose a character to steal from";

        public override IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            if (!Used)
                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = Description,
                    Choices = game.Characters.Where(c =>
                        c.No > 2 &&
                        !c.Dead &&
                        !game.FaceupCharacters.Contains(c)).Select(c => c.Name)
                });
            return res;
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            var target = game.GetPlayerByCharacter(info.Target);
            if (target == null) return;
            target.RobbedBy(info.Target, owner);
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target != null && info.District == null;
        }
    }

    public class MagicianAbility : AbstractAbility
    {
        public override IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            if (!Used)
            {
                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = "Swap your hand with another player",
                    Choices = game.Players.Where(p => p != game.PlayerInTurn).Select(p => p.Username)
                });
                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = "Swap a number of cards in the pile"
                });
            }
            return res;
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            if (info.Target != null) //swap with player
            {
                owner.SwapHand(game.GetPlayerByUsername(info.Target));
            }
            else
            {
                var option = new Option
                {
                    Message = "Discard any number of cards and draw an equal number of cards.",
                    Choices = owner.Hand.Select(c => c.Title)
                };
                game.OnSelect = new StandardSelectStrategy(option, game.SwapWithPile);
            }
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.District == null;
        }
    }

    public class GoldAbility : AbstractAbility
    {
        private const string Description = "Get {count} gold for each {desc} ({color}) district in your city";
        private readonly string _desc;
        private readonly string _color;
        private readonly string _character;

        public GoldAbility(string desc, string color, string character)
        {
            _desc = desc;
            _color = color;
            _character = character;
        }

        public override IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            if (!Used)
                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = Description.
                        Replace("{desc}", _desc).
                        Replace("{color}", _color).
                        Replace("{count}", game.GetPlayerByCharacter(_character).City.Count(c => c.Color == _color) + "")
                });
            return res;
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            owner.Gold += owner.City.Count(c => c.Color == _color);
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target == null && info.District == null;
        }
    }

    public class WarlordAbilty : IAbility
    {
        private readonly IAbility _goldAbility = new GoldAbility("military", "red", "warlord");
        private readonly IAbility _destroyAbility = new WarlordDestroyAbility();

        public void Reset()
        {
            _goldAbility.Reset();
            _destroyAbility.Reset();
        }

        public bool UseAbility(Player owner, AbilityInfo info, Game game)
        {
            if (info.Target != null && info.District != null)
            {
                return _destroyAbility.UseAbility(owner, info, game);
            }
            if (info.Target == null && info.District == null)
            {
                return _goldAbility.UseAbility(owner, info, game);
            }
            return false;
        }

        public IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            res.AddRange(_goldAbility.GetOptions(game));
            res.AddRange(_destroyAbility.GetOptions(game));
            return res;
        }

        public bool Used
        {
            get { return _goldAbility.Used && _destroyAbility.Used; }
        }
    }

    public class WarlordDestroyAbility : AbstractAbility
    {
        private const string Description = "Destroy a district in another players city";

        public override IEnumerable<Option> GetOptions(Game game)
        {
            var res = new List<Option>();
            if (!Used)
            {
                var choices = new List<string>();
                var gold = game.GetPlayerByCharacter("warlord").Gold;
                foreach (var c in game.Characters.Where(c => c.No != 8 && c.No != 5)) //can not destroy warlord or bishops districts
                {
                    var player = game.GetPlayerByCharacter(c.Name);
                    if (player == null) continue;

                    var ds = player.City.Where(d => d.Price - 1 <= gold);

                    choices.AddRange(ds.Select(d => player.Username + "/" + d.Title));
                }

                res.Add(new Option
                {
                    Type = OptionType.UseAbility,
                    Message = Description,
                    Choices = choices
                });
            }
            return res;
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            var target = game.GetPlayerByUsername(info.Target);

            if (target.IsCharacter(5)) throw new HotCitException(ExceptionType.BadAction, "Cannot destroy bishops districts");

            var district = target.City.FirstOrDefault(d => d.Title == info.District);

            if (district == null) throw new HotCitException(ExceptionType.NotFound, info.District + " not found at " + info.Target);

            owner.Gold -= district.Value - 1;

            target.City.Remove(district);
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target != null && info.District != null;
        }
    }

    public class LaboratoryAbility : AbstractAbility
    {
        public override IEnumerable<Option> GetOptions(Game game)
        {
            return new List<Option>
                {
                    new Option
                        {
                            Type = OptionType.UseAbility,
                            Source = "laboratory",
                            Message = "You may discard a district card form your hand and receive on gold from the bank."
                        }
                };
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            game.OnSelect = new StandardSelectStrategy(GetOption(owner), (game1, s, cards) => OnSelect(game1, s, cards, owner));
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target == null && info.District == null;
        }

        public bool OnSelect(Game game, string pid, string[] cards, Player owner)
        {
            owner.Hand.Remove(owner.Hand.First(d => d.Title == cards[0]));
            owner.Gold++;
            return true;
        }

        public Option GetOption(Player owner)
        {
            return new Option
            {
                Type = OptionType.Select,
                Amount = 1,
                Message = "Discard one card and recieve one gold",
                Choices = owner.Hand.Select(d => d.Title)
            };
        }
    }

    public class SmithyAbility : AbstractAbility
    {
        public override IEnumerable<Option> GetOptions(Game game)
        {
            throw new System.NotImplementedException();
        }

        protected override void UseUnusedAbility(Player owner, AbilityInfo info, Game game)
        {
            owner.Gold -= 2;
            for (var i = 0; i < 3; i++)
                owner.Hand.Add(game.TakeDistrict());
        }

        protected override bool CheckInfo(AbilityInfo info)
        {
            return info.Target == null && info.District == null;
        }
    }
}