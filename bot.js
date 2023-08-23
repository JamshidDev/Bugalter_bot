
const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { StatelessQuestion } = require("@grammyjs/stateless-question");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
require('dotenv').config()
const Database = require("./db");

const { userRegister, removeUser } = require("./controllers/userControllers");
const { category_list, add_category, remove_category } = require("./controllers/categoryController");
const { create_order, order_list, active_order } = require("./controllers/orderControllser");
const customLogger = require("./config/customLogger");




const bot_token = process.env.BOT_TOKEN;
const DEV_ID = 5604998397;
const AUTHOR_ID_LIST = [5604998397];
const ACTION_GROUP_ID = -963886772;
const ERROR_LOG_ID = -927838041;
const Database_channel_id = -1001908517057;

const bot = new Bot(bot_token);

const unicornQuestion = new StatelessQuestion("user_id:", async (ctx) => {
    console.log("User thinks unicorns are doing:", ctx.message.reply_to_message.entities);
});
bot.use(unicornQuestion.middleware());

bot.use(async (ctx, next) => {
    ctx.config = {
        is_dev: ctx.from?.id == DEV_ID,
        is_admin: AUTHOR_ID_LIST.includes(ctx.from?.id),
    }

    await next()
})

bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                selected_category: [],
                selected_service: null,
                task: {
                    edsp_file_id: null,
                    edsp_cer_file_id: null,
                    password: null,
                    task_file: null,
                    comment: null,
                },
                selected_order:null,
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

        let data = {
            user_id: ctx.from.id,
            firstname: ctx.from.first_name,
            username: ctx.from.username || null,
        }

        await removeUser(data, ctx)
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
bot.use(createConversation(creating_new_category));

const pm = bot.chatType("private")





async function our_service_conversation(conversation, ctx) {
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
        caption: ` ⚡️<b>Asosiy menu</b>⚡️ \n\n 
❓ Sizda buxgalteriya bilan bog'liq muammolar bormi?
❓ Soliq tekshiruvlaridan charchadingizmi?
❓ Xato va kamchiliklar ko'payib ketdimi?

❗️ Endi bu muammo emas !!!
☝️ Biz sizga o'zimizning sifatli va hamyonbob xizmatlarimizni taklif qilamiz.

👉 Bizning xizmatlarimiz:
1️⃣ Barcha turdagi korxonalar MCHJ, Oilaviy korxona, Xususiy korxona, YATT ochish, ustav va tasis shartnomalari tuzish va ularni davlat ro'yxatidan o'tkazish.

2️⃣ Chakana va ulgurji savdo, ishlab chiqarish, xizmat ko'rsatish korxonalariga sifatli, tezkor va ishonchli buxgalteriya xizmatlarini ko'rsatish.

3️⃣ Barcha turdagi soliqlarni hisoblash va hisobotlarni topshirish, Soliq maslaxatlari:
✅ Foyda solig'i
✅ Qo'shilgan qiymat solig'i (QQS)
✅ Aylanmadan soliq
✅ Yer qaridan foydalanganlik uchun soliq
✅ Jismoniy shaxslardan olinadigan daromad solig'i
✅ Dividend solig'i
✅ Mol-mulk va yer solig'i
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
        await ctx.reply("<b>🔑 EDSP kalitini yuklang</b>", {
            parse_mode: "HTML",
        });

    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuklandi</b>\n\n <i>🔑 EDSP kalitini yuklang</i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    let file_id = ctx.msg.document.file_id
    let send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.edsp_file_id = send_msg.document.file_id;

    // EDSP sertificate
    await ctx.reply("<b>📄 EDSP sertifikatni yuklang</b>", {
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuklandi</b>\n\n <i>🔑 EDSP sertifikatni yuklang </i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    file_id = ctx.msg.document.file_id
    send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.edsp_cer_file_id = send_msg.document.file_id;

    // Password
    await ctx.reply("<b>🔐 Parolni kiriting</b>", {
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();
    if (!ctx.msg.text) {
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuklandi</b>\n\n <i>🔐 Parolni kiriting</i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.text);
    }
    conversation.session.session_db.task.password = ctx.msg.text;


    // Employee list file
    await ctx.reply("<b>📁 Ishchilar ro'yhatini yuklang (Word yoki excel fayl)</b>", {
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply("⚠️ <b>Noto'g'ri ma'lumot yuklandi</b>\n\n <i>📁 Ishchilar ro'yhatini yuklang (Word yoki excel fayl)</i> ", {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    file_id = ctx.msg.document.file_id
    send_msg = await ctx.api.sendDocument(Database_channel_id, file_id);
    conversation.session.session_db.task.task_file = send_msg.document.file_id;

    // Comment text
    await ctx.reply("💬 Izoh yozing");
    ctx = await conversation.wait();
    conversation.session.session_db.task.comment = ctx.msg?.text;
    if (ctx.session.session_db.selected_service && ctx.session.session_db.task.edsp_file_id) {
        let data = await ctx.session.session_db.task;
        data.report_name = ctx.session.session_db.selected_service.name;
        let order_data = {
            service_category: ctx.session.session_db.selected_service._id,
            edsp_key: data.edsp_file_id,
            task_file: data.task_file,
            edsp_cer: data.edsp_cer_file_id,
            password: data.password,
            comment: data.comment,
            client_id: ctx.from.id,
        }
        let order = await create_order(order_data);
        console.log(order);
        data.order_number = order.order_number;

        // Send message Admin and Channel
        let sender_list = [Database_channel_id, DEV_ID]
        for (let index in sender_list) {
            await SendTask(sender_list[index], data, ctx);
        }

        await ctx.reply("✅ Buyurtma qabul qilindi!");
        await ctx.reply(`
    ✅ <i>Xurmatli mijoz buyurtmani tasdiqlash uchun to'lovni amalga oshirishingiz zarur!</i>
    \n✅ <i>To'lov amalgandan keyin xizmat 24 soat ichida bajarilib bot orqali sizga xabar yuborladi.</i>
    \n<b>💵To'lov summasi: 100.000 so'm</b>
        
        `, {
            parse_mode: "HTML",
        })
        return
    } else {
        await ctx.reply("🛑 <b>Kutilmagan xatolik yuz berdi</b>\n\n <i>Itlimos qayta harakat qiling</i> ", {
            parse_mode: "HTML",
        });
    }










}

async function payment_conversation(conversation, ctx) {
    await ctx.reply(`
✅ <i>Xurmatli mijoz buyutmani tasdiqlash uchun to'lovni amalga oshirishingiz zarur!</i>
\n✅ <i>To'lov amalgandan keyin xizmat 24 soat ichida bajarilib bot orqali sizga xabar yuborladi.</i>
\n✅ <i>To'lov </i>
\n<b>💵To'lov summasi: 100.000 so'm</b>
    `, {
        parse_mode: "HTML",
    })

    return

}

async function creating_new_category(conversation, ctx) {
    await ctx.reply("🔰 Yangi xizmat turini nomini kiriting! \n\n ✍️ <b>Masalan: </b> <i> Mol-mulk va yer solig'i</i>", {
        parse_mode: "HTML"
    });

    ctx = await conversation.wait();

    if (!ctx.message?.text) {
        do {
            await ctx.reply("Noto'g'ri ma'lumot kiritildi! \n\n <b>Masalan: </b> <i> Mol-mulk va yer solig'i</i>", {
                parse_mode: "HTML"
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }

    let data = {
        name: ctx.message.text
    };
    await add_category(data, ctx);
    await ctx.reply("✅ Muvofaqiyatli yaratildi");
    return
}


const continue_menu = new Menu("continue_menu")
    .text("♻️ Boshlash", async (ctx) => {
        await ctx.conversation.enter("task_data_conversation");
    });
pm.use(continue_menu)


const our_service_menu = new Menu("our_service_menu")
    .dynamic(async (ctx, range) => {
        let list = await category_list();
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
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage();
        ctx.reply(`⚜️⚜️ <b>Biz haqimizda</b>⚜️⚜️
 \n<i>Kompaniya turli faoliyat turlaridagi korxonalarda buxgalteriya xizmatlarini ko'rsatish sohasida 10 yildan ortiq tajribaga ega.
 Mutaxassislarimiz iqtisodiy ma'lumotga va moliyaviy hisob va korxona boshqaruvi sohasida xalqaro sertifikatlarga ega. Kompaniyaning majburiy talabi muntazam ravishda malaka oshirishdir.</i>       
        `, {
            parse_mode: "HTML"
        });

    })
pm.use(start_menu);


const action_category_menu = new Menu("action_category_menu")
    .text("Tahrirlash ✏️", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.reply("Tez orada ishga tushiriladi bu funksiya")
    })
    .row()
    .text("O'chirish 🗑", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage();
        let selected_category = await ctx.session.session_db.selected_category;
        if(selected_category){
            await remove_category(selected_category);
            await ctx.reply("✅ O'chirildi");
        }else{
            ctx.reply("Eskirgan xabar \n\n <i>Iltimos qayta harakat qiling!</i>")
            await ctx.reply("🛑 <b> Eskirgan xabar</b> \n\n <i>Iltimos qayta harakat qiling!</i>", {
                parse_mode: "HTML",
            });
        }
        
    })
pm.use(action_category_menu);



const admin_order_menu = new Menu("admin_order_menu")
.dynamic(async (ctx, range) => {
    let list = await active_order();
    list.forEach((item) => {
        range
            .text(item.is_payment? "✅ ":"⛔️ " + (item.order_number || "0") + " | "+  new Date(item.created_at).toLocaleDateString("en-US") , async (ctx) => {
                await ctx.answerCallbackQuery();
                ctx.session.session_db.selected_order = item;
            })
            .row();
    })
})
pm.use(admin_order_menu);



const admin_category_list = new Menu("admin_category_list")
    .dynamic(async (ctx, range) => {
        let list = await category_list();
        list.forEach((item) => {
            range
                .text("🔰 " + item.name, async (ctx) => {
                    ctx.session.session_db.selected_category = item;
                    ctx.deleteMessage();
                    ctx.reply(` 
                    Tanlangan xizmat turi: <b>🔰  ${item.name}</b> 
                    \n<i>Vazifani bajarish uchun kerakli fayl va ma'lumotlarni bizga taqdim etishingiz lozim!</i>
                    `, {
                        parse_mode: "HTML",
                        reply_markup: action_category_menu,
                    })
                })
                .row();
        })
    }).text("➕ Yangi qo'shish", async (ctx) => {
        await ctx.answerCallbackQuery()
        await ctx.conversation.enter("creating_new_category");
    })
pm.use(admin_category_list);




async function SendTask(msg_id, data, ctx) {

    let info_message = await ctx.api.sendMessage(msg_id,
        `
    <b>✅ Yangi buyurtna</b>
<b>🛅 Buyurtma raqami: </b> ${data.order_number}   
<b>📄 Hisobot turi: </b> ${data.report_name}
<b>👨‍💼Yuboruvchi: </b> <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>  
<b>📆 Sana: </b> ${new Date().toLocaleString()}
<b>🔐 Parol: </b> <i>${data.password}</i>
<b>💬 Izoh: </b> <i>${data.comment}</i>
<b>💵 To'lov summasi: </b> <i>Amalga oshirilmagan </i> ❌
#Buyurtma
    `, {
        parse_mode: "HTML"
    });
    ctx.api.sendMediaGroup(msg_id, [InputMediaBuilder.document(data.edsp_file_id), InputMediaBuilder.document(data.edsp_cer_file_id), InputMediaBuilder.document(data.task_file)], {
        reply_to_message_id: info_message.message_id
    })

}

pm.on("msg").filter(async (ctx) => {
    let permission = ctx.config.is_dev || ctx.config.is_admin;
    let is_reply_message = Boolean(ctx.message?.reply_to_message);
    return (permission && is_reply_message)
},
    (ctx) => {
        console.log(ctx.message.reply_to_message.entities);
    })




const back_main_menu = new Keyboard()
    .text("♻️ Bizning xizmatlar")
    .row()
    .text("🔙 Asosiy menu")
    .resized();

const admin_main_menu =new Keyboard()
.text("♻️ Buyurtmalar")
.text("♻️ Xizmatlar")
.row()
.resized();


pm.command("start", async (ctx) => {

    let data = {
        user_id: ctx.from.id,
        firstname: ctx.from.first_name,
        username: ctx.from.username || null,
    }

    await userRegister(data, ctx);
    let is_admin = await ctx.config.is_admin;
    if(is_admin){
        await ctx.reply(`👨‍💻 Salom Admin`, {
            reply_markup: admin_main_menu
        });
    }else{
        await ctx.reply(`Salom ${ctx.from.first_name}. Xush kelibsiz!`, {
            reply_markup: back_main_menu
        });
        await ctx.conversation.enter("main_menyu_conversation");
    }
    // await ctx.conversation.enter("payment_conversation");


});


pm.hears("🔙 Asosiy menu", async (ctx) => {
    await ctx.conversation.enter("main_menyu_conversation");
})
pm.hears("♻️ Bizning xizmatlar", async (ctx) => {
    await ctx.conversation.enter("our_service_conversation");
})
pm.hears("♻️ Xizmatlar", async (ctx) => {
    await ctx.reply("🔰 <b>Barcha xizmat turlari</b>", {
        reply_markup: admin_category_list,
        parse_mode: "HTML"
    });
})
pm.hears("♻️ Buyurtmalar", async (ctx) => {
    await ctx.reply("🔰 <b>Buyurtmalar ro'yhati</b>", {
        reply_markup: admin_order_menu,
        parse_mode: "HTML"
    });
})



bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    customLogger.log({
        level: 'error',
        message: e
    });
});



bot.start();