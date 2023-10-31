const {Composer,Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder} = require("grammy");
const GeneralService = require("../service/services/GeneralService")
const { Menu, MenuRange } = require("@grammyjs/menu");

const {
    createConversation, conversations,
} = require("@grammyjs/conversations");


const Database_channel_id = -1001908517057;
const bot = new Composer();

const pm = bot.chatType("private")







pm.use(createConversation(task_data_conversation));










async function task_data_conversation(conversation, ctx) {

    conversation.session.session_db.task.edsp_file_id = null;
    conversation.session.session_db.task.edsp_cer_file_id = null;
    conversation.session.session_db.task.password = null;
    conversation.session.session_db.task.task_file = null;
    conversation.session.session_db.task.comment = null;

    // EDSP key files
    await ctx.reply(ctx.t("task_key_title"), {
        parse_mode: "HTML",
    });

    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply(ctx.t("task_key_title_error"), {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    let file_id_1 = ctx.msg.document.file_id
    let send_msg = await ctx.api.sendDocument(Database_channel_id, file_id_1);
    conversation.session.session_db.task.edsp_file_id = send_msg.document.file_id;
    ctx = await conversation.wait();
    if (!ctx.msg.document) {
        do {
            await ctx.reply(ctx.t("task_cer_error"), {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.document);
    }
    let file_id_2 = ctx.msg.document.file_id

    send_msg = await ctx.api.sendDocument(Database_channel_id, file_id_2);
    conversation.session.session_db.task.edsp_cer_file_id = send_msg.document.file_id;
    // Password
    await ctx.reply(ctx.t("password_title"), {
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();
    if (!ctx.msg.text) {
        do {
            await ctx.reply(ctx.t("password_title_error"), {
                parse_mode: "HTML",
            });
            ctx = await conversation.wait();
        } while (!ctx.msg.text);
    }
    conversation.session.session_db.task.password = ctx.msg.text;
    conversation.session.session_db.task.task_file = "no file_id";
    // Comment text
    await ctx.reply(ctx.t("comment_title"));
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

        console.log(order_data)
        // let order = await create_order(order_data);
        // data.order_number = order.order_number;

        // Send message Admin and Channel
        let sender_list = [Database_channel_id]
        for (let index in sender_list) {
            await SendTask(sender_list[index], data, ctx);
        }

        // await ctx.reply(ctx.t("order_create", {
        //     order_number: order.order_number
        // }), {
        //     parse_mode: "HTML"
        // });
        // await ctx.reply(`
        // ✅ <i>Xurmatli mijoz buyurtmani tasdiqlash uchun to'lovni amalga oshirishingiz zarur!</i>
        // \n✅ <i>To'lov amalgandan keyin xizmat 24 soat ichida bajarilib bot orqali sizga xabar yuborladi.</i>
        // \n<b>💵To'lov summasi: 100.000 so'm</b>
        //
        //     `, {
        //     parse_mode: "HTML",
        // })
        return
    } else {
        await ctx.reply(ctx.t("expire_msg"), {
            parse_mode: "HTML",
        });
    }

}





// helper functions
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
    // InputMediaBuilder.document(data.task_file)
    ctx.api.sendMediaGroup(msg_id, [InputMediaBuilder.document(data.edsp_file_id), InputMediaBuilder.document(data.edsp_cer_file_id)], {
        reply_to_message_id: info_message.message_id
    })

}








pm.command("start", async (ctx)=>{
    let referral = ctx.match?  ctx.match.split("=")[1] : null;
    let data = {
        fullName:ctx.from.first_name + " "+ (ctx.from.last_name || ''),
        user_id:ctx.from.id,
        username: ctx.from.username || null,
        referal_id:referral || null,
        lang: ctx.from.language_code
    }
    const [error, res_data] = await  GeneralService.register_user({data});

    const main_menu = new Keyboard()
        .text("💰 Bizning xizmatlar")
        .row()
        .text("🆓 Xizmatlar")
        .text("🆕 Yangiliklar")
        .row()
        .text("ℹ️ Biz haqimizda")
        .text("⚙️ Sozlamalar")
        .resized()


    await  ctx.reply(`
👋 Salom ${ctx.from.first_name}, Xush kelibsiz!    
    `, {
        reply_markup:main_menu,
        parse_mode:"HTML"
    })
})

pm.hears("ℹ️ Biz haqimizda", async (ctx) => {
    await ctx.replyWithPhoto(new InputFile("./resource/picture/document.jpg"), {
        parse_mode:"HTML",
        caption:`Kompaniyamiz kichik va o'rta biznes uchun yuqori sifatli buxgalteriya xizmatlarini taklif etadi. Biz buxgalteriya hisobi, soliqni rejalashtirish, moliyaviy tahlil va hisobotlarni o'z ichiga olgan to'liq xizmatlarni taklif etamiz. Bizning tajribali buxgalterlar jamoasi sizning biznesingizni rivojlantirishga e'tibor qaratishingiz uchun buxgalteriya hisobingiz to'g'ri va o'z vaqtida bo'lishini ta'minlaydi. Xizmatlarimiz haqida ko'proq ma'lumot olish, shuningdek muvaffaqiyatga erishishingizda sizga yordam berishimiz uchun biz bilan bog'laning.`
    })
})


const premium_btn_list = new Menu("premium_btn_list")
    .dynamic(async (ctx, range) => {
        let list = [{
            name:"Divident sol'ig'i",
            _id:1
        }];
        list.forEach((item) => {
            range
                .text(item.name, async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    ctx.session.session_db.selected_service = item;
                    await ctx.conversation.enter("task_data_conversation");

                })
                .row();
        })
    })

pm.use(premium_btn_list);
pm.hears("💰 Bizning xizmatlar", async (ctx)=>{
    await  ctx.reply("Kerakli xizmatni tanlang!", {
        parse_mode:"HTML",
        reply_markup:premium_btn_list,

    })
})






module.exports = bot;
