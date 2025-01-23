require("dotenv").config();

const Admin = require("../../models/AdminModel");
const MajburiyKanal = require("../../models/MajburiyKanal");
const Users = require("../../models/Users");
const callbackIds = {};
let waitingForAdmin = null; // Adminni kutish holati

async function AdminPanel(bot, msg) {
  const chatId = msg.chat.id;

  // Admin bo'lsa, menyu yuborish
  bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 Adminlar", callback_data: "ShowAdmins" },
          { text: "📢 Kanallar", callback_data: "majburiyObuna" },
        ],
        [{ text: "📊 Statistika", callback_data: "stat" }],
        // [],
      ],
    },
  });

  bot.on("callback_query", async (query) => {
    if (callbackIds[query.id]) return;
    callbackIds[query.id] = true;
    const chatId = query.message.chat.id;

    await bot.answerCallbackQuery(query.id, {
      text: "🕔 Hozirda!...",
      show_alert: false,
    });

    switch (query.data) {
      case "ShowAdmins":
        const admins = await Admin.find(); // Barcha adminlarni olish

        let adminsText = "";

        admins.map((v) => {
          adminsText += "`" + v.adminId + "`" + "\n";
        });

        console.log(adminsText);

        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "📋 Adminlar:\n" + adminsText, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Admin qo'shish", callback_data: "addAdmin" }],
              [
                {
                  text: "➖ Admin olib tashlash",
                  callback_data: "removeAdmin",
                },
              ],
              [
                {
                  text: "🔺 Bosh menuga",
                  callback_data: "restartAdmin",
                },
              ],
            ],
          },
        });
        break;

      //

      case "addAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;

        bot.sendMessage(
          chatId,
          "<b>🆔 /addAdmin sozidan song ID ni yuboring</b>\n\nmisol: /addAdmin 2017025737\n\nℹ️ Istalgan insonnni IDsini bu bot qaytaradi: https://t.me/getmyid_bot",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "ShowAdmins",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/addAdmin (\d+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              const adminId = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi
              if (adminId && adminId.match(/^\d+$/)) {
                try {
                  const existingAdmin = await Admin.findOne({
                    adminId: adminId,
                  });

                  if (existingAdmin) {
                    bot.sendMessage(chatId, "Bu ID allaqachon mavjud.");
                    waitingForAdmin = null;
                  } else {
                    const newAdmin = new Admin({ adminId: adminId });

                    await newAdmin.save();
                    waitingForAdmin = null;

                    bot.sendMessage(
                      chatId,
                      "Admin ID muvaffaqiyatli qo'shildi."
                    );
                    bot.sendMessage(adminId, "Siz admin qilindingiz!.");
                  }
                } catch (err) {
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, admin ID qo'shilmadi."
                  );
                  console.error(err);
                }
              } else {
                bot.sendMessage(chatId, "Iltimos, to'g'ri admin ID kiriting.");
              }
            }
          }
        });
        break;
      //
      case "removeAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;

        bot.sendMessage(
          chatId,
          "<b>🆔 /removeAdmin sozidan song ID ni yuboring</b>\n\nmisol: /removeAdmin 2017025737\n\nℹ️ Istalgan insonnni IDsini bu bot qaytaradi: https://t.me/getmyid_bot",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "ShowAdmins",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/removeAdmin (\d+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              const adminIdToRemove = match[1]; // match[1] foydalanuvchidan kelgan ID bo'ladi
              if (adminIdToRemove && adminIdToRemove.match(/^\d+$/)) {
                try {
                  const adminToRemove = await Admin.findOneAndDelete({
                    adminId: adminIdToRemove,
                  });

                  console.log("adminToRemove", adminToRemove);

                  if (adminToRemove) {
                    bot.sendMessage(chatId, "Admin muvaffaqiyatli o'chirildi.");
                    bot.sendMessage(
                      adminIdToRemove,
                      "Siz endi admin Emassiz!."
                    );
                  } else {
                    bot.sendMessage(
                      chatId,
                      "Berilgan ID bilan admin topilmadi. Iltimos, to'g'ri ID kiriting."
                    );
                  }

                  waitingForAdmin = null;
                } catch (err) {
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, admin o'chirilmadi."
                  );
                  console.error(err);
                }
              } else {
                bot.sendMessage(chatId, "Iltimos, to'g'ri admin ID kiriting.");
              }
            }
          }
        });
        break;
      //
      case "addChanell":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;
        bot.sendMessage(
          chatId,
          "<b>ℹ️ /q_kanal sozidan song kanal usernamesini yuboring. </b>\n\nMasalan: /q_kanal @murodillayev_hojiakbar",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "majburiyObuna",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/q_kanal (@\w+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              console.log("1");
              const username = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi

              try {
                const botAdminThisChannel = await bot.getChatMember(
                  username,
                  process.env.TELEGRAM_BOT_TOKEN
                );

                if (botAdminThisChannel.status === "administrator") {
                  console.log("Bot admin!");
                  try {
                    const existingChanell = await MajburiyKanal.findOne({
                      username,
                    });

                    if (existingChanell) {
                      bot.sendMessage(chatId, "Bu kanal allaqachon mavjud.");
                      waitingForAdmin = null;
                    } else {
                      const chatInfo = await bot.getChat(username); // Kanal haqida ma'lumot olish

                      const newChannel = new MajburiyKanal({
                        username,
                        id: chatInfo.id,
                        name: chatInfo.title,
                      });

                      await newChannel.save();
                      waitingForAdmin = null;

                      bot.sendMessage(chatId, "Kanal muvofiqayatlik qoshildi.");
                    }
                  } catch (err) {
                    bot.sendMessage(
                      chatId,
                      "Xatolik yuz berdi, Kanal qoshilmadi."
                    );
                    console.error(err);
                  }
                } else {
                  console.log("Bot admin emas");
                  bot.sendMessage(chatId, "Botni kanalga admin qiling!");
                }
              } catch (err) {
                if (err.response && err.response.statusCode === 400) {
                  console.log("Botni kanalga admin qiling!");
                  console.log("Botni kanalga admin qiling!", err);
                  bot.sendMessage(chatId, "Botni kanalga admin qiling!");
                } else {
                  console.error("Boshqa xatolik:", err);
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, kanalni tekshirishda muammo bor."
                  );
                }
              }
            }
          }
        });
        break;
      //
      case "RemoveChannel":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;
        bot.sendMessage(
          chatId,
          "<b>ℹ️ /r_kanal sozidan song kanal usernamesini yuboring. </b>\n\nMasalan: /r_kanal @murodillayev_hojiakbar",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "majburiyObuna",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/r_kanal (@\w+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              const username = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi

              try {
                const existingChanell = await MajburiyKanal.findOne({
                  username,
                });

                if (!existingChanell) {
                  bot.sendMessage(chatId, "Bu kanal mavjud emas.");
                  waitingForAdmin = null;
                } else {
                  const adminToRemove = await MajburiyKanal.findOneAndDelete({
                    username,
                  });

                  if (adminToRemove) {
                    bot.sendMessage(chatId, username + " kanali ochirildi");
                  } else {
                    bot.sendMessage(chatId, username + " Qandaydur xatolik!");
                  }
                  waitingForAdmin = null;
                }
              } catch (err) {
                bot.sendMessage(
                  chatId,
                  "Xatolik yuz berdi, Kanal ochirilmadi."
                );
                console.error(err);
              }
            }
          }
        });
        break;
      //
      case "showChannels":
        bot.deleteMessage(chatId, query.message.message_id);

        const channels = await MajburiyKanal.find(); // Barcha kanallarni olish
        console.log(channels);

        // Agar kanallar mavjud bo'lsa
        if (channels.length > 0) {
          // Kanallarni inline tugmalar orqali ko'rsatish
          const inlineKeyboard = channels.map((channel) => {
            return [
              {
                text: `${channel.name} - ID: ${channel.id}`,
                url: `https://t.me/${channel.username.slice(1)}`,
              },
            ];
          });

          // Kanallarni foydalanuvchiga yuborish
          bot.sendMessage(chatId, "*📋Kanallar ro'yxati:*", {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                ...inlineKeyboard,
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "majburiyObuna",
                  },
                ],
              ],
            },
          });
        } else {
          bot.sendMessage(chatId, "Hech qanday kanal mavjud emas.");
        }

        break;

      //
      case "majburiyObuna":
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "📢 Kanallar bo'limi !", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Hozirgi kanallar", callback_data: "showChannels" }],
              [
                { text: "➕ Kanal Qo'shish", callback_data: "addChanell" },
                {
                  text: "➖ Kanal O'chirish",
                  callback_data: "RemoveChannel",
                },
              ],
              [
                {
                  text: "🔺 Bosh menuga",
                  callback_data: "restartAdmin",
                },
              ],
            ],
          },
        });
        break;
      //
      case "stat":
        bot.deleteMessage(chatId, query.message.message_id);

        // Foydalanuvchilarni sanash uchun funksiyalar
        const countUsersToday = async () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Bugungi kunning boshlanishi (soat 00:00)

          const count = await Users.countDocuments({
            joinedAt: { $gte: today }, // Bugungi kundan boshlab qo'shilgan foydalanuvchilar
          });

          return count;
        };

        const countUsersThisWeek = async () => {
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Haftaning birinchi kuni

          const count = await Users.countDocuments({
            joinedAt: { $gte: startOfWeek }, // Bu haftada qo'shilgan foydalanuvchilar
          });

          return count;
        };

        const countUsersThisMonth = async () => {
          const startOfMonth = new Date();
          startOfMonth.setDate(1); // Oyning birinchi kuni

          const count = await Users.countDocuments({
            joinedAt: { $gte: startOfMonth }, // Bu oyda qo'shilgan foydalanuvchilar
          });

          return count;
        };

        const countUsersThisYear = async () => {
          const startOfYear = new Date();
          startOfYear.setMonth(0, 1); // Yilning birinchi kuni (1-yanvar)

          const count = await Users.countDocuments({
            joinedAt: { $gte: startOfYear }, // Bu yilda qo'shilgan foydalanuvchilar
          });

          return count;
        };

        // Umumiy obunachilar soni
        const countTotalUsers = async () => {
          const total = await Users.countDocuments(); // Barcha foydalanuvchilar soni
          return total;
        };

        // Statistikalarni olish
        const today = await countUsersToday();
        const thisWeek = await countUsersThisWeek();
        const thisMonth = await countUsersThisMonth();
        const thisYear = await countUsersThisYear();
        const totalUsers = await countTotalUsers(); // To'liq foydalanuvchilar soni

        // Xabarni tayyorlash
        const message =
          `🎉 <b>Botga qo'shilgan foydalanuvchilar statistikasini ko'ring:</b>\n` +
          `\n` +
          `📅 <b>Bugun</b>: ${today} ta yangi foydalanuvchi qo'shildi! ` +
          `\n` +
          `🗓️ <b>Bu hafta</b>: ${thisWeek} ta yangi foydalanuvchi qo'shildi! ` +
          `\n` +
          `📆 <b>Bu oy</b>: ${thisMonth} ta yangi foydalanuvchi qo'shildi! ` +
          `\n` +
          `🏆 <b>Bu yilda</b>: ${thisYear} ta yangi foydalanuvchi qo'shildi! ` +
          `\n\n` +
          `📊 <b>Jami foydalanuvchilar soni</b>: ${totalUsers} ta ` +
          `\n` +
          `🌟 <b>Bu juda ajoyib!</b> Botning rivojlanishi juda tez! `;

        // Xabarni yuborish
        bot.sendMessage(chatId, message, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔺 Bosh menuga",
                  callback_data: "restartAdmin",
                },
              ],
            ],
          },
        });

        break;

      case "restartAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "📋 Adminlar", callback_data: "ShowAdmins" },
                { text: "📢 Kanallar", callback_data: "majburiyObuna" },
              ],
              [{ text: "📊 Statistika", callback_data: "stat" }],
              // [],
            ],
          },
        });
        break;
      //
    }
  });
}

module.exports = { AdminPanel };
