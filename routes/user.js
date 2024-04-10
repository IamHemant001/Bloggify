const Router = require("express");
const User = require("../models/user.js");
const Otp = require("../models/otp.js");
const nodemailer = require("nodemailer");
const methodOverride = require("method-override");
const {crypto,randomBytes, createHmac} = require('node:crypto');

const router = Router();
router.use(Router.json());

router.get("/signin",(req,res)=>{
    res.render("signin.ejs");
});

router.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});

router.post("/signup",async (req,res)=>{
    const {name,email,password,confirmpassword} = req.body;
    await User.create({
        name,
        email,
        password,
        confirmpassword
    });
    res.redirect("/");
});

router.post("/signin",async (req,res)=>{
    const {email,password} = req.body;
    try{
        const token = await User.matchPasswordAndToken(email,password);
        return res.cookie("token",token).redirect("/");
    }catch(err){
        return res.render("signin",{
            error : "Incorrect email or password!",
        });
    }
});

router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/");
})

router.get("/forgetPassword",(req,res)=>{
    res.render("forgetPassword.ejs");
})

router.post("/forgetPassword",async (req,res)=>{
    const {email} = req.body;
    const user1 = User.findOne({email : email}).then((res)=>{
        if(!user1){
            return res.send("User does not exits");
        }
        let otpcode = Math.floor((Math.random()*10000) + 1);
        let newotp = new Otp({
            email : email,
            code : otpcode,
            expireIn : new Date().getTime() + 300*1000
        })
        
        newotp.save().then((res)=>{
            console.log("Chek your email id");
        }).catch((err) =>{
            console.log("Error:",err);
        });
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ar.lifts007@gmail.com',
                pass: 'eamq otgz qksc vkqa'
            }
        });
        
        let mailOptions = {
            from: 'ar.lifts007@gmail.com',
            to: email,
            subject: "Reset your password", 
            text: `your otp is: ${otpcode}`, 
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    })
    const user = await User.findOne({email : email});
    const id = user._id.toString()
    console.log(user._id.toString());
    res.render("verify.ejs",{id});
});

router.post("/verify/:id",async (req,res)=>{
    let {id} = req.params;
    let {otp} = req.body;
    let data = await Otp.find({code : otp})
    if(data){
        let currentTime = new Date().getTime();
        let diff = data.expireIn - currentTime;
        if(diff < 0){
            console.log("Time Expried");
            }else{
                console.log("otp verified");
                res.redirect(`/user/resetPassword/${id}`);           
        }
        }else{
            res.send("Wrong otp");
        }
    });
    
router.get("/resetPassword/:id",async (req,res)=>{
    let {id} = req.params;
    res.render("resetPassword.ejs",{id});
    
});

router.put("/check/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
       const hashPassword = async (pass) => {
      try {
         const salt = randomBytes(16).toString('hex');
        const hashedPassword = createHmac("sha256", salt).update(pass).digest("hex");
        return { salt, hashedPassword };
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
    };

    const { salt, hashedPassword } = await hashPassword(password);

    await User.findByIdAndUpdate(id, { salt, password: hashedPassword });

console.log("Password Changed Successfully");
    res.redirect('/');
} catch (err) {
console.error('Error changing password:', err);
    res.status(500).send('Internal Server Error');
}
});

module.exports = router;
