/*
Sumber plugin:
https://whatsapp.com/channel/0029Vb4jDY82ER6beeXLOp0k (anifch)
------------------------
*/
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.resolve('./cihuyyy.json');

const readDB = async () => {
  try {
    await fs.access(DB_PATH);
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await fs.writeFile(DB_PATH, JSON.stringify({}, null, 2));
    return {};
  }
};

const writeDB = (data) => {
  return fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const UMPAN = {
  cacing: { nama: "Cacing Tanah", harga: 500, bonus: 5 },
  pelet: { nama: "Pelet Super", harga: 2000, bonus: 15 },
  jangkrik: { nama: "Jangkrik Alaska 🦗", harga: 5000, bonus: 30 },
};

const PANCINGAN = {
  kayu: { nama: "Pancingan Bambu 🎋", harga: 0, kekuatan: 20 },
  fiber: { nama: "Pancingan Fiber ✨", harga: 50000, kekuatan: 50 },
  emas: { nama: "Pancingan Emas 🏆", harga: 250000, kekuatan: 100 },
};

const IKAN = [
  { nama: "Plastik Indomaret 🛍️", bobot: [0.1, 0.2], harga: -50, threshold: 0, kategori: "Zonk 🤢" },
  { nama: "Sepatu Butut 👢", bobot: [1, 1], harga: -500, threshold: 5, kategori: "Zonk 🤢" },
  { nama: "Ban Bekas 🛞", bobot: [5, 10], harga: -1000, threshold: 10, kategori: "Zonk 🤢" },

  { nama: "Ikan Kembung 🐡", bobot: [0.2, 0.5], harga: 2000, threshold: 15, kategori: "Umum ⚪" },
  { nama: "Ikan Lele", bobot: [0.5, 2], harga: 1000, threshold: 30, kategori: "Umum ⚪" },
  { nama: "Ikan Nila Merah", bobot: [0.3, 1.5], harga: 1500, threshold: 50, kategori: "Umum ⚪" },
  { nama: "Ikan Patin", bobot: [1, 3], harga: 2500, threshold: 70, kategori: "Umum ⚪" },
  
  { nama: "Ikan Gurame", bobot: [1.5, 4], harga: 5000, threshold: 90, kategori: "Langka 🟢" },
  { nama: "Ikan Kakap Merah", bobot: [2, 6], harga: 8000, threshold: 110, kategori: "Langka 🟢" },
  { nama: "Belut Listrik ⚡", bobot: [1, 2.5], harga: 12000, threshold: 130, kategori: "Langka 🟢" },

  { nama: "Gabus Raksasa", bobot: [3, 8], harga: 10000, threshold: 140, kategori: "Epik 🔵" },
  { nama: "Ikan Kakap🐟", bobot: [1, 2], harga: 25000, threshold: 170, kategori: "Epik 🔵" },
  { nama: "Arwana 🐉", bobot: [2, 5], harga: 50000, threshold: 190, kategori: "Epik 🔵" },

  { nama: "Paus Biru 🐳", bobot: [1000, 2000], harga: 1000000, threshold: 215, kategori: "Legendaris 🟣" },
  { nama: "MEGALODON 🦈", bobot: [5000, 8000], harga: 5000000, threshold: 227, kategori: "Mitos 🟠" },
];

const MANCING_COOLDOWN = 20 * 1000;
const MAX_HISTORY = 15;

const handler = async (m, {conn, args, usedPrefix, command, user }) => {
  const db = await readDB();
  const sender = m.sender;
  const subcommand = args[0]?.toLowerCase();

  const defaultPlayer = {
    nama: user.name,
    Saldo: 1000,
    pancingan: 'kayu',
    umpan: { cacing: 10, pelet: 0, jangkrik: 0 },
    history: [],
    lastMancing: 0,
  };
  
  if (subcommand !== 'mulai' && !db[sender]) {
    return m.reply(`Kamu belum memulai petualangan memancingmu. Ketik *${usedPrefix}${command} mulai* untuk bergabung!`);
  }
  
  // --- KODE MIGRASI DATA & INISIALISASI ---
  if (db[sender]) {
    // Jika ada properti 'koin' (data lama), pindahkan nilainya ke 'Saldo' lalu hapus 'koin'
    if (db[sender].koin !== undefined) {
      db[sender].Saldo = db[sender].koin;
      delete db[sender].koin;
    }
    // Inisialisasi properti yang mungkin hilang
    if (db[sender].history === undefined) db[sender].history = [];
    if (db[sender].Saldo === undefined) db[sender].Saldo = 0;
  }

  switch (subcommand) {
    case 'mulai':
      if (db[sender]) {
        return m.reply(`Kamu sudah memulai petualangan memancingmu, *${db[sender].nama}*! 🎣`);
      }
      db[sender] = defaultPlayer;
      await writeDB(db);
      m.reply(`Selamat datang di "Empang Kang Ujang", *${user.name}*! Kamu dapat pancingan bambu dan 10 cacing gratis. Gunakan *${usedPrefix}${command} bantuan* untuk melihat perintah.`);
      break;

    case 'tas': case 'inv':
      const p = db[sender];
      let tasText = `*🎒 Tas Pancing ${p.nama} 🎒*\n\n`;
      tasText += `*💰 Saldo:* Rp ${p.Saldo.toLocaleString('id-ID')}\n`;
      tasText += `*🎣 Pancingan:* ${PANCINGAN[p.pancingan].nama}\n\n`;
      tasText += `*🪱 Umpan yang Dimiliki:*\n`;
      let punyaUmpan = false;
      for (const umpanKey in p.umpan) {
        if (p.umpan[umpanKey] > 0) {
          tasText += `- ${UMPAN[umpanKey].nama}: ${p.umpan[umpanKey]} buah\n`;
          punyaUmpan = true;
        }
      }
      if (!punyaUmpan) tasText += `_Kosong melompong... Beli umpan di toko!_`;
      m.reply(tasText.trim());
      break;

    case 'toko':
      const player = db[sender];
      let tokoText = `🏪 *TOKO PANCING KANG UJANG* 🏪\n`;
      tokoText += `_"Silakan dibeli, dek. Jangan cuma diliatin😑"_\n\n`;
      tokoText += `💰 *Saldo Kamu:* Rp ${player.Saldo.toLocaleString('id-ID')}\n`;
      tokoText += `------------------------------------------\n`;
      tokoText += `🎣 *ETALASE PANCINGAN*\n`;
      tokoText += `_Upgrade pancingan biar dapet ikan kakap!_\n\n`;
      for (const pKey in PANCINGAN) {
        if (pKey !== 'kayu') {
          const pancing = PANCINGAN[pKey];
          const status = player.pancingan === pKey ? '✅ (Dipakai)' : `Rp ${pancing.harga.toLocaleString('id-ID')}`;
          tokoText += `*› ${pancing.nama}*\n`;
          tokoText += `  ↳ Kekuatan: ${pancing.kekuatan} | Harga: *${status}*\n`;
          tokoText += `  ↳ Perintah: \`.mancing beli ${pKey}\`\n\n`;
        }
      }
      tokoText += `------------------------------------------\n`;
      tokoText += `🪱 *ETALASE UMPAN*\n`;
      for (const uKey in UMPAN) {
        const umpan = UMPAN[uKey];
        tokoText += `*› ${umpan.nama}*\n`;
        tokoText += `  ↳ Bonus Hoki: +${umpan.bonus} | Harga: Rp ${umpan.harga.toLocaleString('id-ID')}\n`;
        tokoText += `  ↳ Perintah: \`.mancing beli ${uKey} [jumlah]\`\n\n`;
      }
      tokoText += `_Contoh: .mancing beli jangkrik 10_`;
      m.reply(tokoText.trim());
      break;

    case 'beli':
      const itemToBuy = args[1]?.toLowerCase();
      const amount = parseInt(args[2]) || 1;
      if (!itemToBuy) return m.reply(`Mau beli apa? Cek di *${usedPrefix}${command} toko*`);
      if (amount <= 0) return m.reply("Jumlah tidak valid!");
      if (UMPAN[itemToBuy]) {
        const totalCost = UMPAN[itemToBuy].harga * amount;
        if (db[sender].Saldo < totalCost) return m.reply(`Duitmu kurang, nih! 😥 Butuh Rp ${totalCost.toLocaleString('id-ID')}, Saldomu cuma ${db[sender].Saldo.toLocaleString('id-ID')}.`);
        db[sender].Saldo -= totalCost;
        db[sender].umpan[itemToBuy] = (db[sender].umpan[itemToBuy] || 0) + amount;
        await writeDB(db);
        m.reply(`Berhasil membeli *${amount} ${UMPAN[itemToBuy].nama}*! 👍`);
      } else if (PANCINGAN[itemToBuy]) {
        if (db[sender].pancingan === itemToBuy) return m.reply("Kamu sudah punya pancingan itu!");
        const cost = PANCINGAN[itemToBuy].harga;
        if (db[sender].Saldo < cost) return m.reply(`Duitmu kurang, nih 😥 Butuh Rp ${cost.toLocaleString('id-ID')}.`);
        db[sender].Saldo -= cost;
        db[sender].pancingan = itemToBuy;
        await writeDB(db);
        m.reply(`Mantap! Kamu berhasil membeli *${PANCINGAN[itemToBuy].nama}*! 🎣`);
      } else {
        m.reply(`Barang "${itemToBuy}" tidak ada di toko, dek.`);
      }
      break;

    case 'go':
      const umpanToUse = args[1]?.toLowerCase();
      if (!umpanToUse || !UMPAN[umpanToUse]) return m.reply(`Pilih umpan yang mau dipakai!\nContoh: *${usedPrefix}${command} go cacing*\n\nUmpan tersedia: cacing, pelet, jangkrik.`);
      if (!db[sender].umpan[umpanToUse] || db[sender].umpan[umpanToUse] < 1) return m.reply(`Umpan *${UMPAN[umpanToUse].nama}* kamu habis! Beli dulu di toko.`);
      const now = Date.now();
      if (now - db[sender].lastMancing < MANCING_COOLDOWN) {
        const timeLeft = MANCING_COOLDOWN - (now - db[sender].lastMancing);
        return m.reply(`istirahat dulu 😴 Coba lagi dalam *${Math.ceil(timeLeft / 1000)} detik*.`);
      }
      db[sender].umpan[umpanToUse] -= 1;
      db[sender].lastMancing = now;
      await m.reply(`Kamu melempar pancingan dengan *${UMPAN[umpanToUse].nama}*... Sabar, semoga ada yang nyangkut... ⏳`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const bonusUmpan = UMPAN[umpanToUse].bonus;
      const kekuatanPancing = PANCINGAN[db[sender].pancingan].kekuatan;
      const chance = Math.random() * (100 + bonusUmpan + kekuatanPancing);
      const sortedIkan = IKAN.sort((a, b) => b.threshold - a.threshold);
      let caughtFish = sortedIkan.find(fish => chance >= fish.threshold);
      if (!caughtFish) caughtFish = IKAN.find(fish => fish.nama.includes("Plastik"));
      const bobot = (Math.random() * (caughtFish.bobot[1] - caughtFish.bobot[0])) + caughtFish.bobot[0];
      const hargaJual = Math.round(bobot * caughtFish.harga);
      db[sender].Saldo += hargaJual;
      const historyEntry = { nama: caughtFish.nama, harga: hargaJual };
      db[sender].history.unshift(historyEntry);
      if (db[sender].history.length > MAX_HISTORY) db[sender].history.pop();
      await writeDB(db);
      if (hargaJual > 0) {
        let replyMsg;
        if (caughtFish.threshold >= 215) {
          replyMsg = `*GILA GILA GILA! TANGKAPAN MITOS!* 😱\n\nDengan susah payah, kamu berhasil menarik *${caughtFish.nama}* seberat *${bobot.toFixed(2)} kg*!\n*Kategori: ${caughtFish.kategori}*\n\nIkanmu laku *Rp ${hargaJual.toLocaleString('id-ID')}*! Kamu jadi legenda desa! 👑`;
        } else {
          replyMsg = `*STRIKE!* 🎣\n\nKamu berhasil mendapatkan *${caughtFish.nama}* seberat *${bobot.toFixed(2)} kg*!\n*Kategori: ${caughtFish.kategori}*\nIkanmu laku dijual seharga *Rp ${hargaJual.toLocaleString('id-ID')}*! 🤑`;
        }
        m.reply(replyMsg);
      } else {
        m.reply(`*ZONK!* 😭\n\nSialan! Kamu malah dapet *${caughtFish.nama}*!\n*Kategori: ${caughtFish.kategori}*\nKamu rugi *Rp ${Math.abs(hargaJual).toLocaleString('id-ID')}* buat ngelepasinnya. Apes bener...`);
      }
      break;

    case 'history': case 'riwayat':
      if (!db[sender].history || db[sender].history.length === 0) return m.reply("Kamu belum punya riwayat tangkapan. Ayo mancing dulu!");
      const playerHistory = db[sender].history;
      let historyText = `*📜 Riwayat Tangkapan ${db[sender].nama} 📜*\n_(Menampilkan ${playerHistory.length} tangkapan terakhir)_\n\n`;
      playerHistory.forEach((item, index) => {
        const emoji = item.harga >= 0 ? '✅' : '❌';
        historyText += `${index + 1}. ${item.nama} → *Rp ${item.harga.toLocaleString('id-ID')}* ${emoji}\n`;
      });
      m.reply(historyText.trim());
      break;

    case 'bantuan':
    default:
      const playerHelp = db[sender];
      if (!playerHelp) {
        m.reply(`Selamat datang di game mancing! Ketik *.mancing mulai* untuk memulai petualanganmu!`);
        return;
      }
      let helpText = `*🎣 PANDUAN MANCING MANIA 🎣*\n\n`;
      helpText += `Halo, *${playerHelp.nama}*!\n`;
      helpText += `Saldo kamu saat ini: *Rp ${playerHelp.Saldo.toLocaleString('id-ID')}* 💰\n\n`;
      helpText += `Gunakan: *.mancing <perintah>*\n\n`;
      helpText += `*Perintah Utama:*\n`;
      helpText += `- *go <umpan>*: Mulai memancing (Cooldown: 20 dtk).\n`;
      helpText += `- *tas / inv*: Melihat isi tas pancingmu.\n`;
      helpText += `- *history / riwayat*: Melihat riwayat tangkapan.\n\n`;
      helpText += `*Toko Kang Ujang:*\n`;
      helpText += `- *toko*: Melihat barang yang dijual.\n`;
      helpText += `- *beli <item> [jumlah]*: Membeli umpan atau pancingan.\n\n`;
      helpText += `_Semoga dapet ikan!_`;
      m.reply(helpText.trim());
      break;
  }
};

handler.command = ['mancing', 'fishing', 'mancingmania'];
handler.tags = ['game'];
handler.help = ['mancing <perintah>'];
handler.description = "mancing ikan bukan mancing emosi.";
handler.limit = false;

export default handler;