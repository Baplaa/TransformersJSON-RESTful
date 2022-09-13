const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require('morgan')
const path = require('path')

const app = express();
const db = mongoose.connect("mongodb://localhost/transformersAPI");
const router = express.Router();
const port = process.env.PORT || 3000;
const Bot = require("./models/dataModel");

const fs = require('fs')
const logFile = fs.createWriteStream('./access.log', {flags: 'a'})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);

router
    .route("/bots")

    //this POST method creates a new transformer object to be added in the JSON data
    .post((req, res) => {
        const bot = new Bot(req.body);
        bot.save();
        return res.status(201).json(bot);
    })

    //this GET method displays all transformers with the queried faction from the JSON data
    .get((req, res) => {
        const bot = new Bot(req.body);
        const query = {};
        if (req.query.faction) {
            query.faction = req.query.faction;
        }
        Bot.find(query, (err, bots) => {
            if (err) {
                return res.send(err);
            }
            return res.json(bots);
        })
    })

    //this DELETE method deletes the object of a particular transformer in the JSON data
    .delete((req, res) => {
        const bot = new Bot(req.body);
        const query = {};
        Bot.find(query, (err, bots) => {
            if (err) {
                return res.send(err);
            }
            for (i of bots) { i.remove() };
            return res.json(bots);
        })
    });

router.use("/bots/:botId", (req, res, next) => {
    //this function displays information of a particular transformer based on the provided ID
    Bot.findById(req.params.botId, (err, bot) => {
        if (err) {
            return res.send(err);
        }
        if (bot) {

            req.bot = bot;
            return next();
        }
        return res.sendStatus(404);
    });
});

router
    .route("/bots/:botId")

    //this POST method creates a new transformer based on the provided ID
    .post((req, res) => {
        const bot = new Bot(req.body);
        bot.save();
        return res.status(201).json(bot);
    })

    //this DELETE method deletes a transformer and its information based on the provided ID
    .delete((req, res) => {
        req.bot.remove((err) => {
            if (err) {
                return res.send(err);
            }
            return res.json(req.bot);
        });
    })

    //this PATCH method updates a particular attribute of a transformer, the transformer object is accessed based on the provided ID
    .patch((req, res) => {
        const { bot } = req;
        req.body.faction ? bot.faction = req.body.faction : null;
        req.body.name ? bot.name = req.body.name : null;
        req.body.position ? bot.position = req.body.position : null;
        bot.save();
        return res.json(bot);
    })

    //this PUT method updates a transformer object completely, the transformer object is accessed based on the provided ID
    .put((req, res) => {
        const { bot } = req;
        bot.faction = req.body.faction;
        bot.name = req.body.name;
        bot.position = req.body.position;
        bot.save();
        return res.json(bot);
    })

    //this GET method displays the information of a particular transformer based on the provided ID
    .get((req, res) => {

        Bot.findById(req.params.botId, (err, bot) => {
            if (err) {
                return res.send(err);
            }
            return res.json(bot);
        });
    });

app.use("/api", router);

//this code creates a log file: "access.log" in the root directory and console logs the time and IP address of a user accessing the API
//HTTP request methods are logged as well
//example output: 
//  ::ffff:127.0.0.1 [03/Apr/2022:00:36:55 +0000] GET /favicon.ico 404 0.856 ms
app.use(morgan({format:":ip [:date[clf]] :method :url :status :response-time ms", stream: {
    write: function(str)
    {
        logFile.write(str);
        console.log(str);
    }
}}));

app.get("/", (req, res) => {
    const bot = new Bot(req.body);
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});