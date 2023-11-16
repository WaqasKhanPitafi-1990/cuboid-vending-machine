const { Seeder } =require('mongoose-data-seed');
const  Model  =require('../model/userModel');
const bcrypt = require('bcryptjs');
const res = require('express/lib/response');
const data = [{
  user_name :"super_admin",
  user_email:"admin@gmail.com",
  user_password: "admin123@",
  user_role_id:null,
  user_role: "super_admin",
  user_phone:"32123",
  user_permission: "",
  user_status: "Active",
  white_list_user:false
}];

class UsersSeeder extends Seeder {

  async shouldRun() {
  
    return Model.countDocuments().exec().then(count => count === 0);
  }

  async run() {
    const hash = await bcrypt.hash('admin123@', 10);
    data[0].user_password=hash
    return Model.create(data);
  }
}

module.exports=UsersSeeder;
