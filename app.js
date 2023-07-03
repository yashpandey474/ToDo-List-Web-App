const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();
const _ = require("lodash");

//USE THE MODULE FOR FORMATTED DATE
const day = date.getDate();

//USE EJS FOR TEMPLATING OF HTML FILES
app.set("view engine", 'ejs');
//USE BODYPARSER TO READ ITEMS FROM POST REQUESTS
app.use(bodyParser.urlencoded({
    extended: true //ALLOWS US TO POST NESTED OBJECTS
}));
//SERVE THE PUBLIC FOLDER
app.use(express.static("public"))


//CONNECT TO A DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");


//NEW ITEMS SCHEMA
const itemsSchema = new mongoose.Schema({
    name: {
        type: String
    }
});

//NEW ITEMS MODEL
const Item = mongoose.model(
    "Item",
    itemsSchema
);


//CREATE DEFAULT ITEMS
const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

//DEFAULT ITEMS
const defaultItems = [item1, item2, item3];

//SCHEMA FOR CUSTOM LIST
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

//MODEL FOR CUSTOM LIST
const List = mongoose.model('List', listSchema);


//ADD DEFAULT ITEMS IF ITEMS ARE EMPTY
app.get(
    "/",
    function(request, response){


       //SHOW ALL ITEMS IN DATABASE
        Item.find({})
            .then(function (items) {
                //ADD DEFAULT ITEMS IF EMPTY
                if (items.length === 0){
                    Item.insertMany(defaultItems)
                    .then(() => {
                        //REDIRECT TO RENDER PAGE AFTER INSERTING DEFAULT ITEMS
                      console.log("Successfully added default Items");
                      response.redirect("/")
                    })
        
                    .catch((err) => {
                        //IF ERROR IN ADDING ITEMS
                      console.log(err);
                    });
                }
                //ELSE RENDER PAGE WITH FOUND ITEMS
                else{
                    response.render("list", { listTitle: day, newListItems: items });
                }
            })
            .catch(function (err) {
                console.log(err);
            });
});

//HANDLE GET REQUESTS AT WORK
app.get(
    "/:customListName",
    function(request, response){
        const customListName = _.capitalize(request.params.customListName);

        //ONLY SAVE IF LIST DOESNT EXIST IN DATABASE
        List.findOne({
            name: customListName
        })
        .then(function(foundList){
            //DOES NOT EXIST IN DATABASE
            if(!foundList){
                //CREATE A NEW DOCUMENT
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });

                //SAVE IN LISTS COLLECTION
                newList.save();

                //RENDER THE PAGE
                response.redirect("/" + customListName);
            }
            //EXISTS IN DATABASE
            else{
                //SHOW PAGE
                response.render(
                    "list",
                    {listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        })
        .catch(function (err) {
                console.log(err);
        });
        
    }
)

//HANDLE GET REQUESTS FOR ABOUT ROUTE
app.get(
    "/about",
    function(request, response){
        response.render("about")
    }
)
//HANDLE POST REQUESTS AT ROOT
app.post(
    "/",
    function(request, response){
        const itemName = request.body.newItem;
        const listName = request.body.submit;

        //ADD ITEM TO COLLECTION
        const newItem = new Item({
            name: itemName
        });
        
        console.log("QUERIED LIST = " + listName);
        if(listName == day){
            //ADD NEW ITEM
            newItem.save();
            //SHOW ON THE PAGE
            response.redirect("/")
        }
        else{
            //ADD TO CUSTOM LIST
            List.findOne({
                name: listName
            })
            .then(function(foundList){
                //ADD NEW ITEM
                foundList.items.push(newItem);
                //UPDATE LIST ITEM
                foundList.save();
                //SHOW ON PAGE
                response.redirect("/" + foundList.name);
            })
            .catch(function(err){
                if(err){
                    console.log(err);
                }
            });
        }
        
        
});

//HANDLE REQUESTS TO DELETE POSTS
app.post(
    "/delete",
    function(request, response){
       const checkedItemId = request.body.checkbox;
       const listName = request.body.list;

        //DELETE FROM CORRECT LIST
        if (listName == day){
            //DELETE ITEM FROM DATABAE
            Item.findByIdAndRemove(
                checkedItemId
            ).then(() => {
                //REDIRECT TO RENDER PAGE AFTER INSERTING DEFAULT ITEMS
                console.log("Successfully deleted Item with id: " + checkedItemId);
                response.redirect("/")
            })

                .catch((err) => {
                    //IF ERROR IN ADDING ITEMS
                    console.log(err);
                });
        }
        else{
            List.findOneAndUpdate(
                {name: listName},
                {$pull: {items: {_id: checkedItemId}}}
            )
            .then(function(results){
                console.log("Deleted item from custom list " + listName);
                response.redirect("/" + listName);
            })
            .catch(function(err){

            });
        }

       
});

//START SERVER AT PORT 3000
app.listen(3000, function(request, response){
    console.log("Server started on port 3000");
});