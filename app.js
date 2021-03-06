const express = require("express");
const bodyParser = require("body-parser");

//requiring moongoose
const mongoose = require('mongoose');

// to capitalize first letter of our list name
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

//creating and connectiong to our server
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewURLParser:true});
//creating schema
const itemsSchema = {
  name : String
};

//moongose model based on schema above

const Item = mongoose.model("Item",itemsSchema);

//adding Items to your model
const item1 = new Item ({
  name : "Welcome to your TodoList"
});
const item2 = new Item ({
  name : "Hit + to add a new Item"
});
const item3 = new Item ({
  name : "<-- Hit this to delete an Item"
});

const defaultItems = [item1,item2,item3];

//new sheama list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//create mongoose model

 const List = mongoose.model("List", listSchema);






app.get("/", function(req, res) {



  //getting data by using Mongoose.find

  Item.find({}, function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added the default items to database");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle : "Today",newListItems: foundItems });
  }
  });

});

app.get("/:customListName", function(req,res){
const customListName = _.capitalize(req.params.customListName);


List.findOne({name:customListName},function(err,foundList){
  if(!err){
  if(!foundList){
    //creating document based on List model ---- create new list
    const list = new List({
      name:customListName,
      items:defaultItems
    });
          list.save();
          res.redirect("/"+customListName);
  }else{
    //dont create document ---- show existing list

    res.render("list", {listTitle : foundList.name,newListItems: foundList.items });

  }
}
});




});





app.post("/",function(req,res){
  const itemName = req.body.newItem;

  //after getting the item we will re direct to the above code to make it display in the list
  const listName=req.body.titleName;

const item = new Item({
  name:itemName
});

if(listName!="Today"){
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}else{
  item.save();
  res.redirect("/");
}



});

//new post request to delete items

app.post("/delete",function(req,res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;
if(listName=="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully delted the item");
      res.redirect("/");
  }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}




});



app.listen(3000, function() {
  console.log("server is running on port 3000");
});
