
const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard, InputFile } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
require('dotenv').config()
const Database = require("./db");




const bot_token = process.env.BOT_TOKEN;
const DEV_ID = 5604998397;
const AUTHOR_ID = null;
const ACTION_GROUP_ID = 423423;
const ERROR_LOG_ID = 234423;

const bot = new Bot(bot_token);



bot.use(async (ctx, next) => {

    ctx.config = {
        is_dev: ctx.from?.id == DEV_ID,
        is_author: ctx.from?.id == AUTHOR_ID,
    }

    await next()
})

bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                our_service_list: [],
                selected_service: null,
            }
        },
        storage: new MemorySessionStorage()
    },
    conversation: {},
}));



bot.use(conversations());
bot.use(createConversation(our_service_conversation));
bot.use(createConversation(main_menyu_conversation));

const pm = bot.chatType("private")





async function our_service_conversation(conversation, ctx) {
    let service_list = [
        {
            name: "JSHDS hisoboti", id: 1
        },
        {
            name: " Aylanma soliq hisoboti", id: 2
        },
        {
            name: "Foyda solig'i hisoboti", id: 3
        },
    ];
    conversation.session.session_db.our_service_list = service_list;
    ctx.reply(`<b>👨‍💻 Biz "Bugalters Group" jamoasi sizga tezkor va sifatli bugalteriya xizmatlarini taklif etadi. </b>
     \n\n<i>Bizning xizmatlar 👇</i>`, {
        reply_markup: our_service_menu,
        parse_mode: "HTML",
    })
    return

}


async function main_menyu_conversation(conversation, ctx) {
    let client_id = ctx.from.id;
    let photo_url = new InputFile("./resource/picture/start_picture.png");
    ctx.api.sendPhoto(client_id, photo_url, {
        caption: ` ⚡️<b>Asosiy menu</b>⚡️ \n\n <i>Biz <b>"Bugalters Group"</b> jamoasi sizga tezkor va sifatli bugalteriya xizmatlarini taklif etadi. </i>
        ✅ <i>Bizning xizmatlar</i>:
        <b>1️⃣ JSHDS hisoboti</b>
        <b>2️⃣ Aylanma soliq hisoboti</b>
        <b>3️⃣ Foyda solig'i hisoboti</b>
        
    <i>☝️ Bizning xizmatlardan foydalanish uchun [<b>📄 Bizning xizmatlar</b>] tugmasini bosing!</i>
    \n <i>☝️ Biz haqimizda batafsil ma'lumot olish uchun [<b>ℹ️ Biz haqimizda</b>] tugmasini bosing!</i>
        `,
        parse_mode: "HTML",
        reply_markup: start_menu
    })
    return
}


const continue_menu = new Menu("continue_menu")
    .text("♻️ Boshlash", async (ctx) => {
        ctx.reply("Yuklang...")
    });
pm.use(continue_menu)


const our_service_menu = new Menu("our_service_menu")
    .dynamic(async (ctx, range) => {
        let list = await ctx.session.session_db.our_service_list
        list.forEach((item) => {
            range
                .text("📄" + item.name, async (ctx) => {
                    ctx.session.session_db.selected_service = item;
                    ctx.deleteMessage();



                    ctx.reply(` 
                    Tanlangan xizmat turi: <b>${item.name}</b> 
                    \n<i>Vazifani bajarish uchun kerakli fayl va ma'lumotlarni bizga taqdim etishingiz lozim!</i>
                    `, {
                        parse_mode: "HTML",
                        reply_markup: continue_menu,
                    })



                })
                .row();
        })
    })
pm.use(our_service_menu);



const start_menu = new Menu("start_menu")
    .text("📄 Bizning xizmatlar", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage();
        await ctx.conversation.enter("our_service_conversation");
    })
    .row()
    .text("ℹ️ Biz haqimizda", async (ctx) => {
        await ctx.answerCallbackQuery()
        ctx.reply("Bu bo'lim tez orada ishga tushishi reja qilingan");

    })
pm.use(start_menu);




























pm.command("start", async (ctx) => {
    await ctx.conversation.enter("main_menyu_conversation");

});





bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    console.log(e);
});



bot.start();