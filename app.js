//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const e = require("express");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url= ("mongodb+srv://admin-tavor:DavidBlu13@cluster0.1q3ltk2.mongodb.net/todolistDB");
mongoose.connect(url,{useNewUrlParser:true});
const itemsSchema={
  name:String
};
const Item= mongoose.model("Item",itemsSchema);
const item1= new Item({
  name:"Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}).then((foundItems)=>{
    if(foundItems.length ===0){
      Item.insertMany(defaultItems).then(()=>{
        console.log("Successfully inserted default items to DB");
      }).catch((error)=>{
        console.log(error);
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems,item:Item});
    }

  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name:itemName
  });
  if(listName === "Today"){
    item.save().then(()=>{res.redirect("/");});
  }
  else {
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    }).catch((err)=>{

    });
  }
});

app.post("/delete",function (req, res) {
  const checkedItemId= req.body.checkbox;
  const listName= req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(()=>{
      console.log("Success");
      res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}}).then((foundList)=>{
        res.redirect("/"+listName);
    }).catch((err)=>{

    });
  }

});

app.get("/:customListName",(req, res)=>{
 const customListName= _.capitalize(req.params.customListName);
 List.findOne({name: customListName}).then((foundList)=>{
   if(!foundList){
     console.log("Doesnt exist!");
     //create a new list
     const list= new List({
       name:customListName,
       items:defaultItems
     });
     list.save().then(r => {
       console.log("SAVED");
       res.redirect("/"+customListName);
     });
   }
   else {
     console.log("Exist!");
     // show an existing list
     res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
   }
 }).catch((error)=>{
   console.log("ERROR");

 });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
