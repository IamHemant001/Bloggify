const Router = require("express");
const multer = require("multer");
const Blog = require("../models/blog.js");
const Comment = require("../models/comments.js");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname,`../public/uploads`))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`
      cb(null, fileName);
    }
  });
  
  const upload = multer({ storage: storage });

router.get("/add-new",(req,res)=>{
    res.render("addBlogs.ejs",{
        user : req.user,
    });
});

router.post("/",upload.single("coverImage"),async (req,res)=>{
    const {body,title} = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy : req.user._id,
        coverImgURL : `/uploads/${req.file.filename}`
    });
    console.log(req.body);
    console.log(req.file);
    // return res.redirect(`/blog/${blog._id}`);
    return res.redirect(`/`);
})

router.get("/:id",async(req,res)=>{
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({blogId : req.params.id}).populate("createdBy");
  // console.log(blog);
  return res.render("blog.ejs",{
    user : req.user,
    blog,
    comments
  })
});

router.post("/comment/:blogId",async(req,res)=>{
  await Comment.create({
    content : req.body.comment,
    blogId : req.params.blogId,
    createdBy : req.user._id
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})
module.exports = router;
