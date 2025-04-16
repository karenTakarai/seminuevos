const express = require('express');
const app = express();
const publish = require('./publish')
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.post("/publish", async (req,res)=>{
    const { price, description } = req.body;
    try {
        await publish(price,description);
        res.send('screen completed');
    } catch (error) {
        console.log('error', error);
        res.status(500).send('Error during the process', error);
    }
});

app.listen(3000,()=>{
    console.log("server listening from http://localhost:3000");
});
