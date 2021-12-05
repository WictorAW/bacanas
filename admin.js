

// Database
const mongoose = require("mongoose");

// Admin Bro
const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");

// Custom Actions Imports
const userIdAssign = require('./src/actions/UserID-Assign.hook')

const { 
  after: ImageUploadAfterHook, 
  before: ImageUploadBeforeHook 
} = require('./src/actions/Image-Upload.hook')

// Use Mongoose in AdminBro
AdminBro.registerAdapter(AdminBroMongoose);

// Resources Definintions
const User = mongoose.model('User', {
  email: {type: String, required: true},
  usuario: {type: String, required: true},
  senhaCriptografada: {type: String, required: true},
  tipo: {type: String, enum: ['admin', 'restricted'], required: true},
});

// Cars Collection
const Carros = mongoose.model('car', {
  userID: {
    type: mongoose.Types.ObjectId,
    ref: 'User',},

  Marca: String,
  Modelo: String,
  Cor: String,
  Ano: String,
  Km: String,
  Chassis: String,
  Shaken: String,
  Katashiki: String,
  GoKeta: String,
  YonKeta: String,
  Pneu: Boolean,
  Oleo: Boolean,
  Waipa: Boolean,
  Milha: Boolean,
  Pastilha: Boolean,
  Filtro: Boolean,
  Farol: Boolean,
  Lanterna: Boolean,
  LuzDeRé: Boolean,
  LuzDeFreio: Boolean,
  Bateria: Boolean,
  PortasAutomatica: Boolean,
  Retrovisor: Boolean,
  Direita: Boolean,
  Esquerda: Boolean,
  Chave: String,
  Estofado: String,
  ETC: Boolean,
  Suspenção: String,
  Cheiro: String,
  ArCondicionado: Boolean,
  Navi: String,
  Tapete: Boolean,
  DriveRecord: String,
  CameraDeRé:Boolean,
  AntiRadar: String,
  Bluetooth:Boolean,
  Som: String,
  TV: Boolean,
  Volante: String,
  Cambio: String,
  Painel: String,
  EstadoDoCarro: String,
  Obs: String,
  imagens: String
})
// Edit Permissions
const canModifyUsers = ({ currentAdmin }) => currentAdmin && currentAdmin.tipo === 'admin'

const canModifyCars = ({ currentAdmin, record}) => {
  return currentAdmin && (
    currentAdmin.tipo === 'admin' || currentAdmin._id === record.param('userID'))}


// Config
const bcrypt = require('bcrypt')
const adminBroOptions = new AdminBro({
  resources: [
    {
    resource: Carros,
    options: {
      properties: {
        imagens: {isVisible: {
          list: false,
          edit: false,
          filter: false,
          show: false

        }},
        shakensho: {
          isVisible: {list: false, edit: true, filter: false, show: true},
          components: {
            edit: AdminBro.bundle('./src/components/Image-Upload.edit.tsx'),
            list: AdminBro.bundle('./src/components/Image-Upload.list.tsx'),
            show: AdminBro.bundle('./src/components/Image-Upload.list.tsx')
          }
        },
        fotoDoCarro: {
          isVisible: {list: true, edit: true, filter: false, show: true},
          components: {
            edit: AdminBro.bundle('./src/components/Image-Upload.edit.tsx'),
            list: AdminBro.bundle('./src/components/Image-Upload.list.tsx'),
            show: AdminBro.bundle('./src/components/Image-Upload.list.tsx'),
          }
        },
        userID: {isVisible: {list: true, edit: false, filter: true, show: true}}},
    actions: {
      new: { 
       before: async (request, context) => {
         modifiedRequest = await userIdAssign(request, context.currentAdmin);
         return ImageUploadBeforeHook(modifiedRequest, context);
        },
        

        after: async (response, request, context) => {
          return ImageUploadAfterHook(response, request, context)
        },
        
      },
      edit: {isAccessible: canModifyCars},
      delete: {isAccessible: canModifyCars},
    }}
    },{
    resource: User,
    options: {
      properties: {
        senhaCriptografada: {isVisible: false},
        password: {
          type: String,
          isVisible: {list: false, edit: true, filter: false, show: false}
        }
      },
    actions: {
      new: {
        isAccessible: canModifyUsers,
        before: async (request) => {
            request.payload = {
              ...request.payload,
              senhaCriptografada: await bcrypt.hash(request.payload.password, 10),
              password: undefined,
            }; 
            return request
          }
        },
      
        edit: {isAccessible: canModifyUsers},
        delete: {isAccessible: canModifyUsers},
    }}
  },
  ],
  branding: {
    companyName: "Bacana`s Garage",
    logo: 'https://bacanasgarage.com/media/admin-interface/logo/Logo_dourada_Yz6un2v.png',
    softwareBrothers: false,
    
    

  },
  locale: {
    translations: {
        messages: {
            loginWelcome: 'Sistema feito por Code-fy' // the smaller text
        },
        labels: {
            loginWelcome: 'Sistema de gerenciamento de carros', // this could be your project name
        },
    }
},
 
  dashboard: {
    handler: async () => {
      return { some: 'output' }
    },
    component: AdminBro.bundle('./src/components/Dashboard.jsx')
  },

  rootpath: '/admin',
});

// REMOVER COMENTARIO DESSA PARTE PARA PODER LOGAR SEM NADA, PRECISA COMENTAR A ROUTER DE BAIXO INTEIRA
//const router = AdminBroExpress.buildRouter(adminBroOptions);

// Build and use a router which will handle all AdminBro routes

const router = AdminBroExpress.buildAuthenticatedRouter(adminBroOptions, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email })
    if (user) {
      const matched = await bcrypt.compare(password, user.senhaCriptografada)
      if (matched) {
        return user
      }
    }
    return false
  },
  cookiePassword: 'some-secret-password-used-to-secure-cookie',
})
// Server
const express = require("express");
const { useActionResponseHandler } = require("admin-bro");
const server = express();

server.use(adminBroOptions.options.rootpath, router);
server.use('/uploads', express.static('uploads'));
// Run App
const run = async () => {
  await mongoose.connect("mongodb://localhost:27017/teste", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await server.listen(5500, () => console.log("Servidor iniciado com Sucesso! http://localhost:5500"));
};

run();

