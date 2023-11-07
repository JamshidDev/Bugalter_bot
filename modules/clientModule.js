const {Composer,Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder} = require("grammy");
const GeneralService = require("../service/services/GeneralService")
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const {
    createConversation, conversations,
} = require("@grammyjs/conversations");

const Database_channel_id = -1001908517057;
const { userRegister, removeUser, get_user_lang, update_user_lang, } = require("../controllers/userControllers");
const { category_list, add_category, remove_category } = require("../controllers/categoryController");
const { create_order, order_list, active_order, get_order, pricing_order, ordering_message_id, finish_order, find_order_for_payment, check_payment_order, paymenting_order, reject_order_info, reject_order } = require("../controllers/orderControllser");
const { add_payment_histry, payment_details } = require("../controllers/paymentcontroller")

const bot = new Composer();

const pm = bot.chatType("private")







pm.use(createConversation(task_data_conversation));
pm.use(createConversation(search_ikpu_conversation));
pm.use(createConversation(main_menu_conversation));
pm.use(createConversation(start_menu_conversation));
pm.use(createConversation(setting_section_conversation));
pm.use(createConversation(free_services_section_conversation));










async function task_data_conversation(conversation, ctx) {

    conversation.session.session_db.task.edsp_file_id = null;
    conversation.session.session_db.task.edsp_cer_file_id = null;
    conversation.session.session_db.task.password = null;
    conversation.session.session_db.task.task_file = null;
    conversation.session.session_db.task.comment = null;

    // EDSP key files
    let back_menu_btn = new Keyboard()
        .text(ctx.t("back_to_main_menu"))
        .resized()
    await ctx.reply(ctx.t("task_key_title"), {
        parse_mode: "HTML",
        reply_markup:back_menu_btn
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
        data.report_name = ctx.session.session_db.selected_service.name_uz;
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
        let order = await create_order(order_data);
        data.order_number = order.order_number;

        // Send message Admin and Channel
        let sender_list = [Database_channel_id]
        for (let index in sender_list) {
            await SendTask(sender_list[index], data, ctx);
        }

        await ctx.reply(ctx.t("order_create", {
            order_number: order.order_number
        }), {
            parse_mode: "HTML"
        });
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

async function main_menu_conversation(conversation, ctx){
    const main_menu = new Keyboard()
        .text(ctx.t("premium_service_name"))
        .row()
        .text(ctx.t("free_service_menu_name"))
        .text(ctx.t("news_order_menu_name"))
        .row()
        .text(ctx.t("about_us_menu_name"))
        .text(ctx.t("setting_menu_name"))
        .resized()


    await  ctx.reply(ctx.t("main_menu_text_command"), {
        reply_markup:main_menu,
        parse_mode:"HTML"
    })
    return;
}

 function validate_search_msg(msg){
   return (msg.length == 9 && msg.includes("-"))? true : false
}
async function search_ikpu_conversation(conversation, ctx){
    let stop_action = new Keyboard()
        .text(ctx.t("stop_action"))
        .placeholder("Debet-Kredit")
        .resized()
   let first_message = true;

    do {
        if(first_message){
            await ctx.reply(ctx.t("ikpu_search_text"), {
                parse_mode: "HTML",
                reply_markup: stop_action,
            });
        }
        first_message = false;
        ctx = await conversation.wait();

        if(ctx.msg.text && validate_search_msg(ctx.msg.text)){
           let  statusMessage = await ctx.reply(ctx.t("loading_bank_text"))
           let debetAndKredit = ctx.msg.text.split("-")
            let data = {
                debet:debetAndKredit[0],
                kredit:debetAndKredit[1],
            }
            const [error, res_data] = await GeneralService.search_bank(data)

            if(res_data.data.length == 0){
                await ctx.reply(ctx.t("no_fount_bank_text"), {
                    parse_mode:"HTML"
                })
            }else{
                let data = res_data.data[0];
                let lang = await ctx.config.lang;
                await ctx.reply(ctx.t("bank_result_message_text", {
                    debet:data.debet,
                    kredit:data.kredit,
                    result:(lang =="ru"? data.result_ru : data.result_uz),
                }), {

                    parse_mode:"HTML"
                })
            }
        }else{

            await ctx.reply(ctx.t("invalid_search_msg"), {
                parse_mode:"HTML"
            })
        }
    } while (true);


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

const about_company_menu = new Menu("about_company_menu")
    .text("ℹ️ Biz haqimizda", async (ctx)=>{
        await  ctx.answerCallbackQuery()
        await ctx.replyWithPhoto(new InputFile("./resource/picture/document.jpg"), {
            parse_mode:"HTML",
            caption:ctx.t("about_us_text")
        })
    });
pm.use(about_company_menu)
async function start_menu_conversation(conversation, ctx) {
    let client_id = ctx.from.id;
    let photo_url ="AgACAgIAAxkBAAMPZUo7XU1s6Qd7C2_CiSSoSziksHwAAhnOMRvL91FKDGja6pryImMBAAMCAAN5AAMzBA";
    await ctx.api.sendPhoto(client_id, photo_url, {
        caption: ctx.t("start_addition"),
        parse_mode: "HTML",
        reply_markup: about_company_menu
    })
    await main_menu_conversation(conversation, ctx);
    return
}


async function setting_section_conversation(conversation, ctx){
    btn_list = new Keyboard()
        .text(ctx.t("change_language_title"))
        .row()
        .text(ctx.t("back_to_main_menu"))
        .resized()
    await  ctx.reply(ctx.t("setting_menu_name"), {
        parse_mode:"HTML",
        reply_markup:btn_list
    })
    return
}


async function free_services_section_conversation(conversation, ctx){
    btn_list = new Keyboard()
        .text(ctx.t("free_service_ikpu_search"))
        .row()
        .text(ctx.t("back_to_main_menu"))
        .resized()
    await  ctx.reply(ctx.t("select_free_service"), {
        parse_mode:"HTML",
        reply_markup:btn_list
    })
    return
}




pm.filter(async (ctx)=> !ctx.config.super_admin).command("start", async (ctx)=>{
    let referral = ctx.match?  ctx.match.split("=")[1] : null;
    let data = {
        fullName:ctx.from.first_name + " "+ (ctx.from.last_name || ''),
        user_id:ctx.from.id,
        username: ctx.from.username || null,
        referal_id:referral || null,
        lang: ctx.from.language_code
    }
    await  GeneralService.register_user({data});


    const main_menu = new Keyboard()
        .text(ctx.t("premium_service_name"))
        .row()
        .text(ctx.t("free_service_menu_name"))
        .text(ctx.t("news_order_menu_name"))
        .row()
        .text(ctx.t("about_us_menu_name"))
        .text(ctx.t("setting_menu_name"))
        .resized()


//     await  ctx.reply(`
// 👋 Salom ${ctx.from.first_name}, Xush kelibsiz!
//     `, {
//         reply_markup:main_menu,
//         parse_mode:"HTML"
//     })
    await ctx.conversation.enter("start_menu_conversation");

})



const premium_btn_list = new Menu("premium_btn_list")
    .dynamic(async (ctx, range) => {
        const [error, res_data] = await  GeneralService.premium_services()
        let lang = await ctx.i18n.getLocale();
        let list = res_data.data;
        list.forEach((item) => {
            range
                .text((lang=='ru'? item.name_ru: item.name_uz), async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    ctx.session.session_db.selected_service = item;
                    await ctx.conversation.enter("task_data_conversation");

                })
                .row();
        })
    })

pm.use(premium_btn_list);
bot.filter(hears("premium_service_name"), async (ctx) => {
    const [error, res] = await  GeneralService.premium_services()
    if(res){
        await  ctx.reply(ctx.t("premuim_service_list_title"), {
            parse_mode:"HTML",
            reply_markup:premium_btn_list,

        })
    }else{
        await ctx.reply(ctx.t("no_premium_service"))
    }

});
// setting menu btn
bot.filter(hears("setting_menu_name"), async (ctx) => {
    await ctx.conversation.enter("setting_section_conversation");
});

// change language btn
bot.filter(hears("change_language_title"), async (ctx) => {
    btn_list = new Keyboard()
        .text(ctx.t("system_lang_uz"))
        .text(ctx.t("system_lang_ru"))
        .row()
        .text(ctx.t("back_to_setting_btn"))
        .resized()
    await  ctx.reply(ctx.t("change_language_title"), {
        parse_mode:"HTML",
        reply_markup:btn_list
    })
});
bot.filter(hears("back_to_setting_btn"), async (ctx) => {
    await ctx.conversation.enter("setting_section_conversation");
});



bot.filter(hears("free_service_menu_name"), async (ctx) => {
    await ctx.conversation.enter("free_services_section_conversation");

});
bot.filter(hears("about_us_menu_name"), async (ctx) => {
    await ctx.replyWithPhoto(new InputFile("./resource/picture/document.jpg"), {
        parse_mode:"HTML",
        caption:ctx.t("about_us_text")
    })
});
bot.filter(hears("free_service_ikpu_search"), async (ctx) => {
    await ctx.conversation.enter("search_ikpu_conversation");
});

bot.filter(hears("system_lang_uz"), async (ctx) => {
    await ctx.i18n.setLocale("uz");
    await ctx.conversation.enter("setting_section_conversation");
});
bot.filter(hears("system_lang_ru"), async (ctx) => {
    await ctx.i18n.setLocale("ru");
    await ctx.conversation.enter("setting_section_conversation");
});



// helper btn list

bot.filter(hears("back_to_main_menu"), async (ctx) => {
    await ctx.conversation.enter("main_menu_conversation");
});
bot.filter(hears("stop_action"), async (ctx) => {
    await ctx.conversation.enter("free_services_section_conversation");
});

module.exports = bot;
