import { REST, Routes, Client, GatewayIntentBits, Partials } from "discord.js";
import {
   dice,
   randomBoxType1,
   showStatus,
   trueFalse,
   rspGame,
} from "./function.js";
import * as dotenv from "dotenv";

dotenv.config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
   {
      name: "사용법",
      description: "사용 가능한 키워드를 보여줍니다.",
   },
];

const instruction =
   "\n%다이스: 1부터 100까지의 숫자를 뽑습니다.\n" +
   "%가위바위보 {가위/바위/보}: 가위바위보를 합니다. (중괄호 제외)\n" +
   "%참거짓: Y/N 답을 뽑습니다.\n" +
   "%가챠: 무작위로 아이템을 뽑습니다.\n" +
   "%정보: 캐릭터의 정보를 확인합니다.\n";

const rest = new REST({ version: "10" }).setToken(TOKEN);

try {
   console.log("Started refreshing application (/) commands.");
   await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
   });
   console.log("Successfully reloaded applicaton (/) commands.");
} catch (err) {
   console.error(err);
}

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
   ],
   partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
   ],
});

client.on("ready", () => {
   console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
   switch (message.content) {
      case "%다이스":
         message.reply(dice());
         break;
      case "%참거짓":
         message.reply(trueFalse());
         break;
      case "%가위바위보":
         message.reply("30초 내로 가위/바위/보 중 하나를 선택해주세요.");

         message.react("✊");
         message.react("✌️");
         message.react("✋");

         const filter = (reaction, user) => {
            return reaction.emoji.name && user.id === message.author.id;
         };

         const collector = message.createReactionCollector({
            filter,
            time: 30000,
         });

         collector.on("collect", (reaction, user) => {
            if (reaction.emoji.name == "✊") message.reply(rspGame("바위"));
            else if (reaction.emoji.name == "✌️")
               message.reply(rspGame("가위"));
            else if (reaction.emoji.name == "✋") message.reply(rspGame("보"));
            else
               message.reply(
                  "유효 시간이 지났거나 다른 걸 내셨군요? 다음 기회에..."
               );

            collector.stop();
         });
         break;
      case "%가챠": {
         const result = await randomBoxType1(message.author.globalName);
         message.reply(result);
         break;
      }
      case "%정보": {
         const result = await showStatus(message.author.globalName);
         message.reply(result);
         break;
      }
      default:
         break;
   }
});

client.on("interactionCreate", async (interaction) => {
   if (!interaction.isChatInputCommand()) {
      await interaction.reply("존재하지 않는 커맨드예요!");
      return;
   }

   if (interaction.commandName === "사용법") {
      await interaction.reply("```" + instruction + "```");
   }
});

client.login(TOKEN);
