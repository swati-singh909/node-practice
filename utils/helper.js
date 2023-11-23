const nodemailer = require('nodemailer')

const generateOtp = (digit) => {
    const otp = Math.floor(
      10 ** (digit - 1) + Math.random() * (10 ** (digit - 1) * 9)
    );
    return otp;
  };



  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'singh.swati.7393@gmail.com',
        pass: 'dxgz eesk zsxy afzb'
    }
});

exports.sendEmail = async (email) => {
    try {
        const info = await transporter.sendMail({
            from: '"he he ha ha "',
            to : email,
            subject : "Verify Email",
            text : `Your otp is 1234`, 
        })
        return info.messageId;
    }
    catch (err) {
        return err.message;
    }

}

exports.otpVerify = (otp) => {
    if(otp === "1234") {
        console.log("Otp matched");
        return true;
       
    }
    else {
        return false;
    }
}

