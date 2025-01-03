import ImageKit from 'imagekit'
import Post from '../models/post.model.js'
import User from '../models/user.model.js'

export const getAllPosts = async(req,res,next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2

    const query = {}

    const cat = req.query.cat
    const author = req.query.author
    const searchQuery = req.query.search
    const sortQuery = req.query.sort
    const featured = req.query.featured
    
    if(cat){
        query.category = cat
    }
    if(searchQuery){
        query.title = {$regex:searchQuery,$options:"i"}
    }
              
    if(author){
        const user = await User.findOne({username:author}).select("_id")
        if(!user){
            return res.status(404).json("no post found!")
        }
        query.user = user._id
    }

    let sortObj = {createdAt: -1}
    if(sortQuery){
        switch (sortQuery) {
            case "newest":
                sortObj = {createdAt:-1}
                break;
            case "oldest":
                sortObj = {createdAt:1}
                break;
            case "most-popular":
                sortObj = {visit:-1}
                break;
            case "trending":
                sortObj = {visit:-1}
                query.createdAt = {
                    $gte:new Date(new Date().getTime() -(7 * 24 * 60 * 60 * 1000))
                }
                break;
        
            default:
                break;
        }
    }
    if(featured){
        query.isFeatured = true
    }

    let totalPosts = await Post.countDocuments(query)
    const hasMore = page * limit < totalPosts
    const posts = await Post.find(query)
    .populate("user","username")
    .sort(sortObj)
    .limit(limit)
    .skip((page-1)*limit)

    res.status(200).json({posts,hasMore})
}

export const getPost = async(req,res,next) => {
    const {slug} = req.params
    const posts = await Post.findOne({slug:slug})
    .populate("user")

    if(!posts){
        return res.status(404).json("Post not found")
    }
    res.status(200).json(posts)
}

export const createPost = async(req,res,next) => {
    const clerkUserId = req.auth.userId
    
    if(!clerkUserId){
        return res.status(401).json("Not Authenticated")
    } 

    const user = await User.findOne({clerkUserId})
    if(!user){
        return res.status(404).json("User not found")
    }

    let slug = req.body.title.replace(/ /g, "-").toLowerCase()

    let existingPost = await Post.findOne({slug})

    let counter = 2
    while(existingPost){
        slug = `${slug}-${counter}`
        existingPost = await Post.findOne({slug})
        counter++
    }

    const newPost = new Post({
        user:user.id,
        ...req.body,
        slug
    })
    const post = await newPost.save()
    res.status(200).json(post)
}

export const featurePost = async(req,res,next) => {
    const clerkUserId = req.auth.userId
    const postId = req.body.postId

    if(!clerkUserId){
        return res.status(401).json("Not Authenticated")
    }
    const role = req.auth.sessionClaims.metadata?.role || "user"
    if(role!=="admin"){
        return res.status(403).json("You cannot feature posts!")
    }

    const post = await Post.findById(postId)
    if(!post){
        return res.status(404).json("post not found")
    }
    const isFeatured = post.isFeatured

    const updatedPost = await Post.findByIdAndUpdate(postId,
        {isFeatured:!isFeatured},
        {new:true}
    )
    res.status(200).json(updatedPost)
}

export const deletePost = async(req,res,next) => {
    const clerkUserId = req.auth.userId
    
    if(!clerkUserId){
        return res.status(401).json("Not Authenticated")
    } 

    const role = req.auth.sessionClaims.metadata?.role || "user"

    if(role==="admin"){
        await Post.findByIdAndDelete(req.params.id)
        return res.status(200).json({deleted:post})
    }

    const user = await User.findOne({clerkUserId})
    if(!user){
        return res.status(404).json("User not found")
    }

    const {id} = req.params
    const post = await Post.findByIdAndDelete({_id:id,user:user?._id})
    if(!post){
        return res.status(403).json("You can delete only your posts!")
    }
    res.status(200).json({deleted:post})
} 

const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT,
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY
  });

export const uploadAuth = async(req,res,next) => {

    const result = imagekit.getAuthenticationParameters()
    res.send(result)
}