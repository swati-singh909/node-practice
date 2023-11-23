const bcrypt = require('bcrypt')

exports.generateHash = async(password) => {
    try {
        const salt = 10;
        const hash = await bcrypt.hash(password.toString(), salt);
        return hash
    }
    catch (err) {
        return err;
    }
}

exports.comparePassword = (password, hash) => bcrypt.compareSync(password, hash);