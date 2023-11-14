import { REST, Routes, Client, GatewayIntentBits, Partials } from "discord.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import * as dotenv from "dotenv";

dotenv.config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const serviceAccountAuth = new JWT({
   email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
   key: process.env.GOOGLE_PRIVATE_KEY,
   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const commands = [
   {
      name: "status",
      description: "Show the status",
   },
];

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

const doc = new GoogleSpreadsheet(
   "1lMlWzsZ4bEJQCHOSdyrPKe4iOJ6Rq82PM0vhz8P_69Q",
   serviceAccountAuth
);
await doc.loadInfo();
const sheet = doc.sheetsByIndex[0];
console.log(sheet.title);

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
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
   if (message.content == "%상태") {
      message.reply("확인했어요!");
   }
});

client.on("interactionCreate", async (interaction) => {
   if (!interaction.isChatInputCommand()) {
      await interaction.reply("존재하지 않는 커맨드예요!");
      return;
   }

   if (interaction.commandName === "status") {
      await interaction.reply("Hi!");
   }
});

client.login(TOKEN);
