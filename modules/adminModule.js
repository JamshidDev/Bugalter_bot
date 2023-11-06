const {Composer,Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder} = require("grammy");
const GeneralService = require("../service/services/GeneralService")
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");

const {
    createConversation, conversations,
} = require("@grammyjs/conversations");

const { userRegister, removeUser, get_user_lang, update_user_lang, } = require("../controllers/userControllers");
const { category_list, add_category, remove_category } = require("../controllers/categoryController");
const { create_order, order_list, active_order, get_order, pricing_order, ordering_message_id, finish_order, find_order_for_payment, check_payment_order, paymenting_order, reject_order_info, reject_order } = require("../controllers/orderControllser");
const { add_payment_histry, payment_details } = require("../controllers/paymentcontroller")


const bot = new Composer();


const pm = bot.chatType("private")


async function msg_sender(message, id) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                let status = await message.copyMessage(id)
                resolve(status);
            } catch (error) {
                reject(error)
            }

        }, 300)
    })
}
pm.use(createConversation(send_msg_conversation));
pm.use(createConversation(admin_main_menu_conversation));



const payment_btn_menu = new Menu("payment_btn_menu")
    .text("To'lov qilish (Payme)", async (ctx) => {
        let msg_id = ctx.update.callback_query.message.message_id;
        let order = await find_order_for_payment(msg_id);
        if (order.length == 1) {
            let order_id = order[0]._id;
            let price = order[0].payment_price

            let chat_id = ctx.chat.id;
            let title = order[0].service_category?.name;
            let description = order[0].order_number + " raqamli buyurtmangizni bajarish uchun to'lov qilishingiz lozim!";
            let payload = order_id;
            let provider_token = payme_tokent;
            let currency = "UZS";
            let prices = [{
                label: "UZS",
                amount: price * 100
            }]
            // [{ "code": "UZS", "title": "Uzbekistani Som", "symbol": "UZS", "native": "UZS", "thousands_sep": " ", "decimal_sep": ",", "symbol_left": false, "space_between": true, "exp": 2, "min_amount": "1208500", "max_amount": "12085000124" }]

            let payment = await ctx.api.sendInvoice(
                chat_id,
                title,
                description,
                payload,
                provider_token,
                currency,
                prices,
            );




        } else {
            ctx.reply(`⚠️ <i>Bu to'lov xabari eskirgan yoki to'lov miqdori o'zgargan!</i> \n\n Ma'lumot uchun: <b>+998(99) 501-60-04 </b>`, {
                parse_mode: "HTML"
            })
        }

    });

pm.use(payment_btn_menu);


pm.use(createConversation(pricing_order_conversation));
async function send_msg_conversation(conversation, ctx) {
    await ctx.reply(`
    <b>⚠️ Barcha foydalanuvchilarga xabar jo'natish</b> 
    
    <i>‼️ Xabar matnini yozing yoki xabarni botga yo'naltiring ↗️</i>
        `, {
        parse_mode: "HTML",
    })
    const message_text = await conversation.wait();
    let keyborad = new Keyboard()
        .text("❌ Bekor qilish xabarni")
        .text("✅ Tasdiqlash xabarni")
        .resized();
    await ctx.reply(`
    <i>Xabarni barcha foydalanuvchilarga yuborish uchun <b>✅ Tasdiqlash xabarni</b> tugmasini bosing!</i> 
       
        `, {
        reply_markup: keyborad,
        parse_mode: "HTML",
    });
    const msg = await conversation.wait();

    if (msg.message?.text == '✅ Tasdiqlash xabarni') {
        await ctx.reply("Barchaga xabar yuborish tugallanishini kuting...⏳")
        let [error, res_data] = await GeneralService.get_user_list();
        const user_list = res_data.data;
        for (let i = 0; i < user_list.length; i++) {
            let user = user_list[i];

            try {
                let status = await msg_sender(message_text, user.user_id);
            } catch (error) {
                console.log(error);
                // await remove_user(user.user_id)
            }
        }

        await ctx.reply("Yakunlandi...✅")
        await admin_main_menu_conversation(conversation, ctx);


    } else {
        await admin_main_menu_conversation(conversation, ctx);

    }
}

async function admin_main_menu_conversation(conversation, ctx){
    const admin_main_menu = new Keyboard()
        .text("♻️ Buyurtmalar")
        .row()
        .text("✍️ Xabar yozish")
        .resized()
    await ctx.reply("⚡️Asosiy Admin menu⚡️", {
        parse_mode:"HTML",
        reply_markup:admin_main_menu
    })
}














async function pricing_order_conversation(conversation, ctx) {
    await ctx.reply(`<b>Buyurtma uchun narx belgilang</b>

♻️ Buyurtma raqami : <b>${ctx.session.session_db.selected_order?.order_number}</b>
🔍 Minimal summa:  <b>15000</b>
✍️ <i>Masalan:  <b>100000</b></i>`, {
        parse_mode: "HTML"
    })

    ctx = await conversation.wait();

    if (!(Number(ctx.message?.text) && +ctx.message?.text > 14000)) {
        do {
            await ctx.reply("Noto'g'ri ma'lumot kiritildi! \n\n <b>Masalan: </b> <i> 100000</i>", {
                parse_mode: "HTML"
            });
            ctx = await conversation.wait();
        } while (!(Number(ctx.message?.text) && +ctx.message?.text > 14000));
    }
    if (ctx.session.session_db.selected_order) {

        let price = ctx.message.text;
        let data = {
            _id: ctx.session.session_db.selected_order._id,
            price: price,
        }
        let order = await pricing_order(data);
        conversation.session.session_db.payment_order = order;
        let user_lang = await get_user_lang(order.client_id);
        let admin_lang = await ctx.i18n.getLocale();
        await ctx.i18n.setLocale(user_lang.lang);

        let payment_message = await ctx.api.sendMessage(order.client_id, ctx.t("pricing_order_text", {
            order_number: order.order_number,
            price: price
        }), {
            parse_mode: "HTML",
            reply_markup: payment_btn_menu,

        });
        await ordering_message_id({
            _id: ctx.session.session_db.selected_order._id,
            payment_message_id: payment_message.message_id
        })
        await ctx.i18n.setLocale(admin_lang);
        await ctx.reply("✅ Narx belgilandi");
    } else {
        await ctx.reply(ctx.t("expire_msg"), {
            parse_mode: "HTML",

        });
    }

}





























pm.filter(async(ctx)=> ctx.config?.super_admin).command("start", async (ctx)=>{
    const admin_main_menu = new Keyboard()
        .text("♻️ Buyurtmalar")
        .row()
        .text("✍️ Xabar yozish")
        .resized()
    await ctx.reply("Salom super Admin", {
        parse_mode:"HTML",
        reply_markup:admin_main_menu
    })
})


























































const order_deatils_menu = new Menu("order_deatils_menu")
    .text("🛑 Rad etish", async (ctx) => {
        await ctx.answerCallbackQuery();
        let selected_order = await ctx.session.session_db.selected_order;
        if (selected_order) {
            let order = await reject_order_info(selected_order._id);
            if (order.length == 1) {
                await ctx.conversation.enter("reject_order_conversation");
            } else {
                await ctx.reply(`<i><b>${selected_order.order_number}</b> raqamli buyurtmani rad etishni mumkin emas! </i> ⚠️`, {
                    parse_mode: "HTML"
                })
            }
        } else {
            await ctx.reply("🛑 <b> Eskirgan xabar</b> \n\n <i>Iltimos qayta harakat qiling!</i>", {
                parse_mode: "HTML",
            });
        }

    })
    .text("🧾 To'lov info", async (ctx) => {
        await ctx.answerCallbackQuery();
        let selected_order = await ctx.session.session_db.selected_order;
        if (selected_order) {
            let payment_info = await payment_details(selected_order._id);

            if (payment_info.length == 1) {
                let msg = payment_info[0];

                await ctx.reply(`
<b>To'lov ma'lumotlari</b>
Buyurtma raqami: <b>${msg?.order_id?.order_number}</b>
To'lov summasi: <b>${msg?.payment_amount}</b> so'm
To'lov sanasi: <b>${new Date(msg.created_at).toLocaleDateString("en-US")}</b>
            `, {
                    parse_mode: "HTML"
                })



            } else {
                await ctx.reply("⚠️ Buyurtma uchun to'lov ma'lumotlari topilmadi!")
            }

        } else {
            await ctx.reply("🛑 <b> Eskirgan xabar</b> \n\n <i>Iltimos qayta harakat qiling!</i>", {
                parse_mode: "HTML",
            });
        }

    }).row()
    .text("💵 Narx belgilash", async (ctx) => {
        await ctx.answerCallbackQuery();
        let selected_order = await ctx.session.session_db.selected_order;
        if (selected_order) {
            await ctx.conversation.enter("pricing_order_conversation");
        } else {
            await ctx.reply("🛑 <b> Eskirgan xabar</b> \n\n <i>Iltimos qayta harakat qiling!</i>", {
                parse_mode: "HTML",
            });
        }

    })
    .row()
    .text("✅ Bajarildi", async (ctx) => {
        await ctx.answerCallbackQuery();
        let selected_order = await ctx.session.session_db.selected_order;
        if (selected_order) {
            let status = await finish_order(selected_order._id);
            if (status) {
                await ctx.reply(`<i><b>${selected_order.order_number}</b> raqamli buyurtma muvofaqiyatli topshirildi ✅ </i>`, {
                    parse_mode: "HTML"
                });
                let user_lang = await get_user_lang(selected_order.client_id);
                let admin_lang = await ctx.i18n.getLocale();
                await ctx.i18n.setLocale(user_lang ? user_lang.lang : 'uz');
                await ctx.api.sendMessage(selected_order.client_id, ctx.t("finished_order_title", { order_number: selected_order.order_number }), {
                    parse_mode: "HTML"
                })
                await ctx.i18n.setLocale(admin_lang);
            } else {
                await ctx.reply(`<i><b>${selected_order.order_number}</b> raqamli buyurtmani yalunlay olmaysiz! </i> ⚠️`, {
                    parse_mode: "HTML"
                })
            }
        } else {
            await ctx.reply("🛑 <b> Eskirgan xabar</b> \n\n <i>Iltimos qayta harakat qiling!</i>", {
                parse_mode: "HTML",
            });
        }
    })

pm.use(order_deatils_menu);






const admin_order_menu = new Menu("admin_order_menu")
    .dynamic(async (ctx, range) => {
        let list = await active_order();
        list.forEach((item) => {
            range
                .text((item.is_payment ? "✅ " : "⛔️ ") + (item.order_number || "0") + " | " + new Date(item.created_at).toLocaleDateString("uz-Cyrl-UZ") + (item.payment_price == 0 ? ' ♦️' : " 🔹"), async (ctx) => {
                    await ctx.answerCallbackQuery();
                    let order = await get_order(item._id);
                    ctx.session.session_db.selected_order = order;
                    await ctx.reply(`
♻️ Buyurtma raqami: <b>${order.order_number}</b>
👨‍💻 Xizmat turi: <b>${order.service_category ? order.service_category.name : "O'chirilgan"}</b>
👨‍💼 Yuboruvchi: <a href="tg://user?id=${order.client_id}">Mijoz (${order.client_id})</a>
📆 Sana: <b>${new Date(order.created_at).toLocaleDateString("en-US")}</b>
🔐 Parol: <b>${order.password}</b>
💵 To'lov summasi: <b>${order?.payment_price} so'm</b>
💵 To'lov: <i>${order.is_payment ? "Amalga oshirilgan ✅" : "Amalga oshirilmagan ❌"}</i>
💬 Izoh: <i>${order.comment}</i>

                    `,
                        {
                            parse_mode: "HTML",
                            reply_markup: order_deatils_menu
                        })
                })
                .row();
        })
    })
pm.use(admin_order_menu);

pm.hears("♻️ Buyurtmalar", async (ctx) => {
    await ctx.reply("🔰 <b>Buyurtmalar ro'yhati</b>", {
        reply_markup: admin_order_menu,
        parse_mode: "HTML"
    });
})







bot.hears("✍️ Xabar yozish", async (ctx) => {
    await ctx.conversation.enter("send_msg_conversation");
});
pm.command("my_telegram_id", async (ctx)=>{
    await  ctx.reply(ctx.from.id)
})

module.exports = bot