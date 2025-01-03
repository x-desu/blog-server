import User from "../models/user.model.js"

export const getUserSavedPosts = async(req,res,next) => {
    const clerkUserId = req.auth?.userId
    if(!clerkUserId){
        return res.status(401).json({message:"Not Authenticated!"})
    }
    const user = await User.findOne({clerkUserId})
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    res.status(201).send(user?.savePosts)
}
export const savePost = async(req,res,next) => {
    const clerkUserId = req.auth?.userId
    const {postId} = req.body
    if(!postId){
        return res.status(404).json("postId not found")
    }
    if(!clerkUserId){
        return res.status(401).json({message:"Not Authenticated!"})
    }
    const user = await User.findOne({clerkUserId})
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    const isSaved = user.savePosts.some(id=>id===postId)
    if(!isSaved){
        await User.findByIdAndUpdate(user._id,{
            $push:{savePosts:postId},
        })
    }else{
        await User.findByIdAndUpdate(user._id,{
            $pull:{savePosts:postId}
        })
    }
    res.status(200).json(isSaved?"Post Unsaved":"Post saved")
}