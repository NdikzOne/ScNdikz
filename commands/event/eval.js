const {
    exec
} = require("child_process");
const util = require("util");

// Promisify exec agar bisa dipakai dengan await
const execPromise = util.promisify(exec);

const handler = {};

// Handler event pesan
handler.onMessage = async (m, {
    conn,
    text,
    isOwner
}) => {
    if (!isOwner || !m.text) return;

    // Eval async: =>
    if (m.text.startsWith("=>")) {
        const code = m.text.slice(2).trim();
        try {
            const result = await eval(`(async () => { 
        try { return await ${code} } 
        catch (e) { return e } 
      })()`);
            return m.reply(util.format(result));
        } catch (e) {
            return m.reply(util.format(e));
        }
    }

    // Eval sync: >
    else if (m.text.startsWith(">")) {
        const code = m.text.slice(1).trim();
        try {
            const result = eval(code);
            return m.reply(util.format(result));
        } catch (e) {
            return m.reply(util.format(e));
        }
    }

    // Shell command: $
    else if (m.text.startsWith("$")) {
        const command = m.text.slice(1).trim();
        if (!command) return m.reply("Masukkan perintah shell.");

        try {
            const {
                stdout,
                stderr
            } = await execPromise(command);
            let output = '';
            if (stdout) output += `*[ stdout ]*\n${stdout.trim()}\n\n`;
            if (stderr) output += `*-- stderr --*\n${stderr.trim()}`;
            if (!output) output = "✅ Perintah berhasil tanpa output.";
            return m.reply(output);
        } catch (e) {
            return m.reply(`❌ ERROR:\n${e.stderr || e.stdout || e.message}`);
        }
    }
};

handler.category = "events"; // Tidak muncul di menu perintah
module.exports = handler;