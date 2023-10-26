const {Composer} = require("grammy");

const bot = new Composer();







bot.command("start", async (ctx)=>{
    let referral = ctx.match?  ctx.match.split("=")[1] : null;
    let data = {
        fullName:ctx.from.first_name + " "+ ctx.from.last_name,
        user_id:ctx.from.id,
        username: ctx.from.username || null,
        referal_id:referral || null,
        lang: ctx.from.language_code
    }
})






module.exports = bot;
