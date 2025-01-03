import express from 'express'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import commentRouter from './routes/comment.route.js'
import webhookRouter from './routes/webhook.route.js'
import connectDB from './lib/connectDB.js'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import cors from 'cors'
const app = express()

app.use(cors({
    origin:process.env.CLIENT_URL,
    methods:["GET","POST","DELETE","PATCH"]
}))
app.use(clerkMiddleware())
app.use('/webhooks',webhookRouter)
app.use(express.json())


app.use('/user',userRouter)
app.use('/post',postRouter)
app.use('/comment',commentRouter)

app.use((error,req,res,next)=>{
    res.status(error.status||500)
    res.json({
        message:error.message || "Something went wrong",
        status:error.status,
        stack:error.stack
    })
})

app.listen(process.env.PORT,()=>{
    connectDB()
    console.log(`Server is running on port ${process.env.PORT}`);
})