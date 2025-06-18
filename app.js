require('dotenv').config()
const express= require('express')
const app=express()
const  db=require('./server/db/db')
const router=require('./routes/userRoutes')

const {readFile}=require('fs')
const path= require('path')

const port=process.env.PORT || 5000

//Parsing Json data
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// Route Endpoint
app.use('/api' , router)

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/' , (req, res)=>{
    const filePath = path.join(__dirname, 'public', 'index.html');

   readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send(data); 
        }
    });

})


app.listen(port, ()=>{
    console.log('Server is up and running')
})