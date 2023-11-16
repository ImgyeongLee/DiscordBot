import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccountAuth = new JWT({
   email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
   key: process.env.GOOGLE_PRIVATE_KEY,
   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
   process.env.GOOGLE_SPREAD_SHEET_ID,
   serviceAccountAuth
);

const statusNums = {
   캐릭터이름: 0,
   재화: 1,
   힘: 2,
   지능: 3,
   민첩: 4,
   운: 5,
};

export const dice = () => {
   return `결과: ${Math.floor(Math.random() * 100) + 1}`;
};

export const trueFalse = () => {
   const randomNumber = Math.floor(Math.random() + 0.5);
   return randomNumber == 1 ? "T" : "F";
};

export const rspGame = (userChoice) => {
   const randomNumber = Math.floor(Math.random() * 3 + 1);
   var botChoice = "";

   if (randomNumber == 1) botChoice = "가위";
   else if (randomNumber == 2) botChoice = "바위";
   else botChoice = "보";

   if (userChoice == botChoice) {
      return "저런! 비겼습니다!";
   } else if (
      (userChoice == "가위" && botChoice == "바위") ||
      (userChoice == "보" && botChoice == "가위") ||
      (userChoice == "바위" && botChoice == "보")
   ) {
      return `당신: ${userChoice}\n상대: ${botChoice}\n\n이런, 져버렸습니다...`;
   } else {
      return `당신: ${userChoice}\n상대: ${botChoice}\n\n야호, 이겼습니다!`;
   }
};

// Google spreadsheet API 7회 사용
// 간략화 할 수 있는 방법이 존재함. 추후 수정 예정.
export const showStatus = async (name) => {
   await doc.loadInfo();
   const sheet = doc.sheetsByTitle["정보"];
   const inventorySheet = doc.sheetsByTitle["소지품"];
   const infos = await sheet.getRows();
   const inventory = await inventorySheet.getRows();
   const row = await findCharacterName(infos, name);
   const itemRow = await findCharacterName(inventory, name);
   var character_inventory = "";

   if (inventory[itemRow]["_rawData"][1]) {
      character_inventory = `소지품: ${inventory[itemRow]["_rawData"][1]}\n`;
   }

   if (row < 0) return "정보를 찾을 수 없습니다.";

   const character_info = infos[row]["_rawData"];
   const name_info = `이름: ${character_info[statusNums["캐릭터이름"]]}\n`;
   const money_info = `재화: ${character_info[statusNums["재화"]]}\n`;
   const power_info = `힘: ${character_info[statusNums["힘"]]} `;
   const int_info = `지능: ${character_info[statusNums["지능"]]} `;
   const dex_info = `민첩: ${character_info[statusNums["민첩"]]} `;
   const luck_info = `운: ${character_info[statusNums["운"]]}\n`;

   const result =
      name_info +
      money_info +
      power_info +
      int_info +
      dex_info +
      luck_info +
      character_inventory;
   return "```" + result + "```";
};

// Google spreadsheet API 3회 사용
export const randomBoxType1 = async (name) => {
   await doc.loadInfo();
   const sheet = doc.sheetsByTitle["아이템"];
   const items = await sheet.getRows();
   const MAXLEN = items.length;

   const rowSelection = Math.floor(Math.random() * MAXLEN);
   const item = items[rowSelection];

   const itemName = item["_rawData"][0];
   const itemDescription = item["_rawData"][1];

   updateInventory(name, itemName);

   return `${itemName}을(를) 뽑았다!\n\n설명: ${itemDescription}`;
};

export const findCharacterName = async (rows, name) => {
   for (let i = 0; i < rows.length; i++) {
      if (rows[i]["_rawData"][0] == name) {
         return i;
      }
   }

   return -1;
};

// Google spreadsheet API 6회 사용
export const updateInventory = async (name, item) => {
   await doc.loadInfo();
   const sheet = doc.sheetsByTitle["소지품"];
   const list = await sheet.getRows();

   const row = await findCharacterName(list, name);

   if (list[row]["_rawData"][1]) {
      const oldInventory = list[row]["_rawData"][1];
      const newInventory = `${oldInventory}, ${item}`;
      list[row].assign({ 소지품: newInventory });
   } else {
      list[row].assign({ 소지품: item });
   }
   list[row].save();
};
