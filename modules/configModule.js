const {Composer, MemorySessionStorage, session} = require("grammy");
const {I18n} = require("@grammyjs/i18n");
const {conversations} = require("@grammyjs/conversations");
const { hydrate  } =require("@grammyjs/hydrate");
const GeneralService = require("../service/services/GeneralService")


const { check_payment_order, paymenting_order } = require("../controllers/orderControllser");
const { add_payment_histry } = require("../controllers/paymentcontroller")



const bot = new Composer();









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
bot.use(hydrate());


bot.on("my_chat_member", async (ctx) => {
    let status = ctx.update.my_chat_member.new_chat_member.status;
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
    const super_admin_list = [5604998397];
    let command_list = [ctx.t("stop_action"), ctx.t("back_to_main_menu"), "/start"];
    if (command_list.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }

    ctx.config = {
        super_admin: super_admin_list.includes(ctx.from?.id),
    }

    // check user lang

    let lang = await ctx.i18n.getLocale();
    if (!i18n.locales.includes(lang)) {
        await ctx.i18n.setLocale("uz");
        ctx.config.lang ='uz';
    }else{
        ctx.config.lang =lang;
    }
    await next()
})























module.exports = bot;