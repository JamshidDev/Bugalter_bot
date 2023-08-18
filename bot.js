
const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
require('dotenv').config()
const Database = require("./db");




const bot_token = process.env.BOT_TOKEN;
const DEV_ID = 5604998397;
const AUTHOR_ID = null;
const ACTION_GROUP_ID=423423;
const ERROR_LOG_ID = 234423;

const bot = new Bot(bot_token); 

bot.use(async(ctx, next)=>{

    ctx.config = {
        is_dev : ctx.from?.id == DEV_ID,
        is_author: ctx.from?.id == AUTHOR_ID,
    }

    await next()
})

bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                user_id: null,
                my_group_list: [],
                selected_group: null,
                channel_list: [],
                group_channel_list: [],
                my_channels_list:[],
            }
        },
        storage: new MemorySessionStorage()
    },
    conversation: {},
}));





bot.command("start", (ctx) => {
    console.log(ctx.from.id);
    ctx.reply("Welcome! Up and running.")
});


bot.on("message", (ctx) => {
    console.log(ctx.message);
}

);







bot.start();