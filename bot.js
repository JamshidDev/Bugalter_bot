
const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder } = require("grammy");
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
const ACTION_GROUP_ID = -963886772;
const ERROR_LOG_ID = -927838041;
const Database_channel_id = -1001908517057;

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
                task: {
                    edsp_file_id: null,
                    edsp_cer_file_id: null,
                    password: null,
                    task_file: null,
                    comment: null,
                }
            }
        },
        storage: new MemorySessionStorage()
    },
    conversation: {},
}));



bot.use(conversations());

bot.on("my_chat_member", async (ctx) => {
    if (ctx.update.my_chat_member.new_chat_member.status == "kicked") {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }
});

bot.use(async (ctx, next) => {
    if (ctx.message?.text == "🔙 Asosiy menu" || ctx.message?.text == "♻️ Bizning xizmatlar") {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }

    await next()

})


bot.use(createConversation(our_service_conversation));
bot.use(createConversation(main_menyu_conversation));
bot.use(createConversation(task_data_conversation));
bot.use(createConversation(payment_conversation));

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


async function task_data_conversation(conversation, ctx) {

    conversation.session.session_db.task.edsp_file_id = null,
        conversation.session.session_db.task.edsp_cer_file_id = null,
        conversation.session.session_db.task.password = null,
        conversation.session.session_db.task.task_file = null,
        conversation.session.session_db.task.comment = null,

        // EDSP key files
        await ctx.reply("🔑 EDSP kalitini yuklang");

    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ Noto'g'ri ma'lumot yuklandi,\n 🔑 EDSP kalitini yuklang ");
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    let file_id = ctx.msg.document.file_id
    let send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.edsp_file_id = send_msg.document.file_id;

    // EDSP sertificate
    await ctx.reply("📄 EDSP sertifikatnis  yuklang");
    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ Noto'g'ri ma'lumot yuklandi,\n 🔑 EDSP sertifikatni yuklang ");
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    file_id = ctx.msg.document.file_id
    send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.edsp_cer_file_id = send_msg.document.file_id;

    // Password
    await ctx.reply("🔐 Parolni kiriting");
    ctx = await conversation.wait();
    if (!ctx.msg.text) {
        do {
            await ctx.reply("⚠️ Noto'g'ri ma'lumot kiritildi,\n 🔐 Parolni kiriting ");
            ctx = await conversation.wait();
        } while (!ctx.msg.text);
    }
    conversation.session.session_db.task.password = ctx.msg.text;


    // Employee list file
    await ctx.reply("📁 Ishchilar ro'yhatini yuklang (Word yoki excel fayl)");
    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ Noto'g'ri ma'lumot yuklandi,\n 🔑 EDSP sertifikatni yuklang ");
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    file_id = ctx.msg.document.file_id
    send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.task_file = send_msg.document.file_id;

    // Comment text
    await ctx.reply("💬 Izoh yozing");
    ctx = await conversation.wait();
    conversation.session.session_db.task.comment = ctx.msg.text;

    let data = await ctx.session.session_db.task;
    data.report_name = ctx.session.session_db.selected_service.name;

    // Send message Admin and Channel
    await SendTask(Database_channel_id, data, ctx);

    await ctx.reply("✅ Buyurtma qabul qilindi!");

    await ctx.reply(`
    ✅ <i>Xurmatli mijoz buyutmani tasdiqlash uchun to'lovni amalga oshirishingiz zarur!</i>
    \n✅ <i>To'lov amalgandan keyin xizmat 24 soat ichida bajarilib bot orqali sizga xabar yuborladi.</i>
    \n<b>💵Tolov summasi: 100.000 so'm</b>
        
        `, {
            parse_mode: "HTML",
        })




    return
}

async function payment_conversation(conversation, ctx) {
    await ctx.reply(`
✅ <i>Xurmatli mijoz buyutmani tasdiqlash uchun to'lovni amalga oshirishingiz zarur!</i>
\n✅ <i>To'lov amalgandan keyin xizmat 24 soat ichida bajarilib bot orqali sizga xabar yuborladi.</i>
\n✅ <i>To'lov </i>
\n<b>💵Tolov summasi: 100.000 so'm</b>
    
    `, {
        parse_mode: "HTML",
    })

}


const continue_menu = new Menu("continue_menu")
    .text("♻️ Boshlash", async (ctx) => {
        await ctx.conversation.enter("task_data_conversation");
    });
pm.use(continue_menu)


const our_service_menu = new Menu("our_service_menu")
    .dynamic(async (ctx, range) => {
        let list = await ctx.session.session_db.our_service_list
        list.forEach((item) => {
            range
                .text("🔰 " + item.name, async (ctx) => {
                    ctx.session.session_db.selected_service = item;
                    ctx.deleteMessage();



                    ctx.reply(` 
                    Tanlangan xizmat turi: <b>🔰  ${item.name}</b> 
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
    .text("♻️ Bizning xizmatlar", async (ctx) => {
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









async function SendTask(msg_id, data, ctx) {
    let info_message = await ctx.api.sendMessage(msg_id,
        `
    <b>✅ Yangi zayavka</b>
 <b>📄 Hisobot turi: </b> ${data.report_name}
<b>👨‍💼Yuboruvchi: </b> <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>  
<b>📆 Sana: </b> ${new Date().toLocaleString()}
<b>🔐 Parol: </b> <i>${data.password}</i>
<b>💬 Izoh: </b> <i>${data.comment}</i>
<b>💵 To'lov summasi: </b> <i>Amalga oshirilmagan </i> ❌
    `, {
        parse_mode: "HTML"
    });
    ctx.api.sendMediaGroup(msg_id, [InputMediaBuilder.document(data.edsp_file_id), InputMediaBuilder.document(data.edsp_cer_file_id), InputMediaBuilder.document(data.task_file)], {
        reply_to_message_id: info_message.message_id
    })
}











bot.on("msg", async (ctx) => {
    console.log(ctx.msg.chat);
})




const back_main_menu = new Keyboard()
    .text("♻️ Bizning xizmatlar")
    .row()
    .text("🔙 Asosiy menu")
    .resized();


pm.command("start", async (ctx) => {

    await ctx.reply(`Salom ${ctx.from.first_name}. Xush kelibsiz!`, {
        reply_markup: back_main_menu
    });
    await ctx.conversation.enter("main_menyu_conversation");
    // await ctx.conversation.enter("payment_conversation");


});

pm.hears("🔙 Asosiy menu", async (ctx) => {
    await ctx.conversation.enter("main_menyu_conversation");
})
pm.hears("♻️ Bizning xizmatlar", async (ctx) => {
    await ctx.conversation.enter("our_service_conversation");
})





bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    console.log(e);
});



bot.start();