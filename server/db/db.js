require('dotenv').config()
const mongoose=require('mongoose')

const db= mongoose.connect(process.env.MONGODB_URI).then(
    ()=>{console.log('Connected to the Database')}
).catch((error)=>{
    console.log("Error connecting to the Database "+ error)
})

module.exports=db