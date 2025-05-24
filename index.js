.env file

DB_Name=codesfortomorrow_db
DB_USER=pg_username
DB_PASSWORD=your_pg_password
DB_HOST=localhost
DB_DILECT=postgres
JWT_SECRET=supersecretjwtkeythatshouldbeverylongandrandom
ADMIN_EMAIL=admim@codesfortomorrow.com
ADMIN_PASSWORD=Admin123!@#

2.src/config.js
javascript

require('.env').config;

module.exports={
  development:{
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_Name,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false//set to true to see SQL queriesin console
  },
  jwtsecret: process.env.JWT_SECRET,
  admin:{
    email: process.env.ADMIN_EMAIL
    password: process.env.ADMIN_PASSWORD
  }
};

3.src/models/index.js //Sequelize initilize and association at this method we add some models

const{Sequelize,Datatypes}=
require('sequelize');
const config= require('../config/config');

const env=process.env.NODE_ENV
const dbconfig = config[env];

const sequelize = new
Sequelize(dbconfig.database,dbconfig.username,
dbconfig.password,{
  host: dbconfig.host,
  dialect: dbconfig.dialect,
  logging: dbconfig.logging

});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Import models
db.user = require;

db.category = require;

db.Service = require;

db.ServicePriceOption = require;

//Sync database(create table if they dont exist) and seed admin user
db.sequelize.sync({force:false}).then(async() =>{ set force to true foe development to drop/recreate tables
  console.log('database synced');
  const bcrypt = require('bcryptjs');
  const adminconfig= config.admin;
  
  try{
    const existingAdmin =  await
    db.user.findOne({where: {email:adminConfig.email}});
    if (!existingAdmin){
      const hashedPassword = await
      bcrypt.hash(adminConfig.password,10);
      await db.user.create({
        email: adminConfig.email,
        password: hashedPassword
      });
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exist.');
    }
    
    } catch (errors) {
      console.error('Error seeding admin user:',error);
  }
}).catch(err=>) {
  console.error('Failed to Sync database:',err);
});

module.exports = db;

4.//src/models/user.js

module.exports = (sequelize,DataTypes)=>{
  const User = sequelize.define('User',{id:
  { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
},
email: {
  type: DataTpes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true
  }
},
password: {
  type: DataTypes.STRING,
  allowNull: false
}
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

return User;

};

5.//src/models/category.js


module.exports = (sequelize,DataTypes)=>{
const Category = sequelize.define('Category',{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
     allowNull: false,
      unique: true,
  }
}, {
   tableName: 'category',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

return Category;
};

6.//src/models/service.js
module.exports = (sequelize,DataTypes)=>{
  const Service = sequelize.define('Service',{id:
  { 
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
},
categoryId:{
  type: DataTypes.INTEGER,
     allowNull: false,
     reference:{
       model:'category',//this is the table name
       key: 'id'
     }
},
name:{
    type: DataTypes.STRING,
     allowNull: false,
},
type: {
  type: DataTypes.ENUM('Normal','VIP'),
  allowNull: false
}
},{
  tableName: 'Services',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

return service;

};

7.//src/models/servicePriceOption.js
module.exports = (sequelize,DataTypes)=>{
  const servicePriceOption = sequelize.define('ServicePriceOption',{id:
  {
    type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true
  },
  serviceId:{
    type: DataTypes.INTEGER,
     allowNull: false,
     reference:{
            model:'service',//this is the table name
       key: 'id
  }
  },
  duration: {
    type: DataType STRING,
     allowNull: false,
  },
  price: {
    type: DataType.Decimal(10,2),
     allowNull: false,
  },
  type:{
    type:DataTypes.ENUM('Hourly','Weekly','Monthly'),
    allowNull: false
  }
  }, {
    tableName: 'ServicePriceOption',
  timestamps: true,
  createdAt: 'createdAt'
    updatedAt: 'updatedAt',
});
return ServicePriceOption;
  };
  
  8.//src/middleware/authMiddleware.js
  const jwt =  require('jsonwebtoken');
  const config = require;
  const db = require;
  
  module.exports = (req,res,next)=>{
    const authHeader=
    req.headers['authorization'];
    if(!authHeader){
      return res.status(401).json({message:'Authorization token not provided.'});
    }
    const token = authHeader.split('')[1];//Expects "Bearer TOKEN"
    
    Iif(!token){
      return res.status(401).json({message:'Token format is "Bearer <token>".'});
    }
    try{
      const decoded = jwt.verify(token,config.jwtSecret);
      req.user = decoded;//attach user info to the request
      next();
    }catch(err) {
      return res.status(401).json({message:'Invalid or expired token.'});
    }
  };
  
9.//  src/controllers/authController.js
const bcrypt = require('/bcryptjs');
const jwt = require();
const db = require();
const config = require;
const user = db.user();

exports.login = async(req.res) =>{
  const{email, password} = req.body;
  
  if(!email || !password) {
    return res.status(400).json({message:'Email and password are required.'});
  }
try
{
  const user= await User.findOne({where:{email}});
  
  if (!user) {
    return res.status(401).json({message:'Invalid credentials'});
  }
const isMatch = await
bcrypt.comapre(password,user.password);

if(!isMatch){
    return res.status(401).json({message:'Invalid credentials'});
  }

const token = jwt.sign(
  
   {id:user.id,email: user.email},
    config.jwtSecret,
    { expiresIn:'1h'} //token expires in one hour
    );
    res.status(200).json({message: 'Login successful',token});
}
catch(error){
  console.error('Login error:',error);
  res.status(500).json({message: 'Server error during login.'});
}
};


10.//src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require();
router.post('/login',authController.login);

module.exports = router;

11.//src/routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require();
const authMiddleware = require();
router.post('/category',authMiddleware,categoryController.createCategory);
router.get('/category',authMiddleware,categoryController.getAllCategory);
router.put('/category',authMiddleware,categoryController.updateCategory);
router.delete('/category/:categoryId',authMiddleware,categoryController.deleteCategory);

12.//src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require();
const authMiddleware = require();
router.post('/category/categoryId/services',authMiddleware,serviceController.createService);
router.get('/category/categoryId/services',authMiddleware,serviceController.getAllServiceIncategory);
router.put('/category/categoryId/services',authMiddleware,serviceController.updateServiceIncategory);
router.delete('/category/categoryId/services',authMiddleware,serviceController.deleteServiceIncategory);

module.exports = router;

13.//src/app.js(main express application)
const express = require('express');
const app = express();

//Middleware
app.use(express.json());

//routes
app.use('/api',require('./routes/authRoutes'));
app.use('/api',require('./routes/categoryRoutes'));
app.use('/api',require('./routes/serviceRoutes'));

//Basic health check route
app.get('/api/health',(req,res)=>{
  res.status(200).json({message: 'API is healthy'});
});

//Global error handler (optional,but good practice)
app.use((err,req,res,next)=>){
  console.error(err.stack);
  res.status(500).send('something broke!');
});

module.exports = app;

14.//src/server.js(Server Startup)
const app = require('/app');
const db = require('/models');//this will run the database sync and admin seeding
const config = require('/config/config');

const PORT = process.env.Port||
config.development.port || 3000;

//start the server only after database is connected and synced
db.sequelize.authenticate()
.then()=> {
  console.log('database connection stablished');
  app.listen(PORT,()=>{
    console.log('server running on port ${PORT}');
  });
})
.catch(err =>{
  console.error('unable to connect to the databse:',err);
});


15//CREATE A FILE NAME IN THE PROJECT ROOT
node_modules/
.env


Explanation:-
This Node.js Express API is designed to manage categories and Services with JWT_based authentication

1.In this code i have use trhe stack technology

2.Database design:It defines four Key tables (users,categories,Services and Service_price_options)

3. Authentication flow: A dedicated post/API/login endpoints allow user to authenticate with a pre-defined admin emsil snd 
pssword.

4.CRUD operation:- Provides standard RESTful endpoints for creating (POST/API/category),retriving all
(GET/api/categories)updating(PUT/api)and deleting(delete/api/categories)

5.This code or project follows a modular structure with seperate lines of codes
directories for models(Sequelize definitions and associations),controller
bussiness logic for each resource),routes(API endpoints definitions),and middleware(authentic logic)













