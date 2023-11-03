const {Composer, MemorySessionStorage, session} = require("grammy");
const {I18n} = require("@grammyjs/i18n");
const {conversations} = require("@grammyjs/conversations");

const GeneralService = require("../service/services/GeneralService")


const bot = new Composer();




// bot.on(":successful_payment", async (ctx) => {
//     await ctx.deleteMessage()
//     let order_id = ctx.msg.successful_payment.invoice_payload;
//     let order_price = ctx.msg.successful_payment.total_amount;
//
//
//     let order = await paymenting_order(order_id)
//     let data = {
//         client_id: ctx.from.id,
//         order_id: ctx.msg.successful_payment.invoice_payload,
//         payment_amount: ctx.msg.successful_payment.total_amount/100,
//         payment_details: ctx.msg.successful_payment
//     }
//     await add_payment_histry(data)
//     await ctx.reply(`<b>To'lov amalga oshirildi</b>
// 🔰 Buyurtma raqami: <b>${order.order_number}</b>
// 💵 To'langan summa: <b>${order_price}</b> so'm `, {
//         parse_mode: "HTML"
//     })
//
//     await ctx.api.sendMessage(DEV_ID, `<b>To'lov amalga oshirildi</b>
// 🔰 Buyurtma raqami: <b>${order.order_number}</b>
// 💵 To'langan summa: <b>${order_price}</b> so'm `, {
//         parse_mode: "HTML"
//     })
// })
//
//
// bot.on("pre_checkout_query", async (ctx) => {
//     let pre_checkout_query_id = ctx.update.pre_checkout_query.id;
//     let order_id = ctx.update.pre_checkout_query.invoice_payload;
//     let order = await check_payment_order(order_id);
//     if (order.length == 1) {
//         await ctx.api.answerPreCheckoutQuery(pre_checkout_query_id, true);
//     } else {
//         await ctx.api.answerPreCheckoutQuery(pre_checkout_query_id, false, {
//             error_message: "Buyurtmaga to'lov qilish cheklangan"
//         });
//     }
// })


















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
                selected_order: null,
                payment_order: null,
            }
        },
        storage: new MemorySessionStorage(),
        // getSessionKey,
    },
    conversation: {},
    __language_code: {},
}));

const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return {first_name: ctx.from?.first_name ?? ""};
    },
});
bot.use(i18n);
bot.use(conversations());

bot.on("my_chat_member", async (ctx) => {
    let status = ctx.update.my_chat_member.new_chat_member.status;
    console.log(status)
    if (status === "kicked") {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
        // removing user from database
        await GeneralService.remove_user(ctx.from.id)
    } else if (status === "administrator") {
        let data = {
            telegram_id: ctx.update.my_chat_member.chat.id,
            user_id: ctx.update.my_chat_member.from.id,
            title: ctx.update.my_chat_member.chat.title,
            username: ctx.update.my_chat_member.chat.username,
            type: ctx.update.my_chat_member.chat.type,
            new_chat: ctx.update.my_chat_member.new_chat_member, // object
        }
        await GeneralService.register_admin({data})
    } else if (status === "left") {
        await GeneralService.remove_admin(ctx.update.my_chat_member.chat.id)
    } else if (status === "member") {
        await GeneralService.remove_admin(ctx.update.my_chat_member.chat.id)
    }
});


bot.use(async (ctx, next) => {
    const super_admin_list = [];
    let command_list = [ctx.t("stop_action"), ctx.t("back_to_main_menu")];
    if (command_list.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }
    ctx.config = {
        super_admin: super_admin_list.includes(ctx.from?.id)
    }
    await next()
})























module.exports = bot;