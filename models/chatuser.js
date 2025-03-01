// import mongoose from "mongoose";

// // Define schema for the ChatUser
// const chatUserSchema = new mongoose.Schema({
//   user_name: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   picture: { // This must match the field used in the API
//     type: String,
//     default: "", // Ensure the default is a string, not an array
//   },
// });


// // Check if the model is already compiled before defining it
// const ChatUser =
//   mongoose.models.ChatUser || mongoose.model("ChatUser", chatUserSchema);

// export default ChatUser;


import mongoose from "mongoose";

const chatUserSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
    default: "",
  },
  user_id: { // Unique identifier for the user
    type: String,
    required: true,
    unique: true,
  },
});

const ChatUser =
  mongoose.models.ChatUser || mongoose.model("ChatUser", chatUserSchema);

export default ChatUser;
