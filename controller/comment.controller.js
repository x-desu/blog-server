import Comment from '../models/comment.model.js'
import User from '../models/user.model.js'

export const getPostComments = async(req,res,next) => {
   const comment = await Comment.find({post:req.params.postId})
   .populate("user","username img")
   .sort({createdAt:-1})

   res.status(200).json(comment)
}

export const addComments = async(req,res,next) => {
    const clerkUserId = req.auth.userId
    const postId = req.params.postId
    if(!clerkUserId){
        return res.status(401).json("Not authenticated!")
    }
    const user = await User.findOne({clerkUserId:clerkUserId})
   
    const newComment = new Comment({
        user:user._id,
        post:postId,
        desc:req.body.desc,
        img:req.body.img
    })
    try {
    const savedComment = await newComment.save()
    } catch (error) {
        console.log(error)
       return next(error)
    }
    res.status(201).json("")
}

export const deleteComments = async(req,res,next) => {
    const clerkUserId = req.auth.userId
    const id = req.params.id
    if(!clerkUserId){
        return res.status(401).json("Not authenticated!")
    }
    const role = req.auth.sessionClaims.metadata?.role || "user"

    if(role==="admin"){
        await Comment.findByIdAndDelete(req.params.id)
        return res.status(200).json("comment deleted")
    }

    const user = await User.findOne({clerkUserId})
    
    try {
        const deletedComment = await Comment.findOneAndDelete({_id:id,user:user._id}) 
        if(!deletedComment){
            return res.status(403).json("Delete your own comments!")
        }
    } catch (error) {
        console.log(error.message)
    }
    
    res.status(200).json("comment deleted")
}