const {Composer,Keyboard, InputFile} = require("grammy");
const GeneralService = require("../service/services/GeneralService")

const bot = new Composer();

const pm = bot.chatType("private")






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






module.exports = bot;
