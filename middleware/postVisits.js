import Post from "../models/post.model.js"

const postVisit = async(req,res,next) =>{
    const {slug} = req.params
    const post = await Post.findOneAndUpdate({slug:slug},{
        $inc:{visit:1},
      },
      {new:true}
    )
    next()
}
export default postVisit