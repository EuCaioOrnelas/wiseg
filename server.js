const moment = require('moment')
const axios = require('axios')
const express = require('express')
var cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res) => res.send({statusServer: 'On'}))

const http = require('http').Server(app)

const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on("connection", function (socket) {
  console.log('user connected')

  socket.on('consult', data => {
    initial(data, socket)
  })
})

http.listen(process.env.PORT || 8080, function(){
  console.log('listening on port 8080')
})


const date = moment().subtract(1, 'days').format()

const cias = [{
  cia: 'Alfa',
  slug: 'ALFA'
},{
  cia: 'Aliro',
  slug: 'ALIRO'
},{
  cia: 'Allianz',
  slug: 'ALLIANZ'
},{
  cia: 'Azul',
  slug: 'AZUL'
},{
  cia: 'BB',
  slug: 'BB'
},{
  cia: 'Bradesco',
  slug: 'BRADESCO'
},{
  cia: 'Caixa',
  slug: 'CAIXA'
},{
  cia: 'Generali',
  slug: 'GENERALI'
},{
  cia: 'HDI',
  slug: 'HDI'
},{
  cia: 'Indiana',
  slug: 'INDIANA'
},{
  cia: 'Liberty',
  slug: 'LIBERTY'
},{
  cia: 'Mapfre',
  slug: 'MAPFRE'
},{
  cia: 'Mitsui',
  slug: 'MITSUI'
},{
  cia: 'Porto',
  slug: 'PORTO'
},{
  cia: 'Sancor',
  slug: 'SANCOR'
},{
  cia: 'SantanderAuto',
  slug: 'SANTANDERAUTO'
},{
  cia: 'Sompo',
  slug: 'SOMPO'
},{
  cia: 'SulamericaAuto',
  slug: 'SULAMERICA'
},{
  cia: 'Tokio',
  slug: 'TOKIOMARINE'
},{
  cia: 'Youse',
  slug: 'YOUSE'
},{
  cia: 'Zurich',
  slug: 'ZURICH'
}]

async function consult(cpf, placa, cia) {
  return new Promise(async (resolve) => {
    const { data } = await axios.get(`https://oag.autoglass.com.br/atendimentos/api/web-app/apolices?CpfCnpj=${cpf}&DataSinistro=${date}&Placa=${placa}&Seguradora=${cia.slug}`)

    console.log(data, cpf, placa, cia)
    console.log(`https://oag.autoglass.com.br/atendimentos/api/web-app/apolices?CpfCnpj=${cpf}&DataSinistro=${date}&Placa=${placa}&Seguradora=${cia.slug}`)

    if(data.ApoliceNaoEncontrada) return resolve({ cia, error: 'not-found' })
    return resolve({ cia })
  })
}

async function initial(data, socket) {
  console.log("Certo, estou pesquisando, agora é só esperar ;)")
  const initialDateTime = moment()
  for (const cia of cias) {
    let start = moment()
    console.log('Pesquisando na', cia.cia);
    socket.emit('checking', cia)
    const response = await consult(data.cpf, data.placa, cia)
    if(!response.error) {
      console.log(`Opaa, achei já está na seguradora: ${response.cia.cia}`)
      socket.emit('found', cia)
      const finalDateTime = moment()
      console.log(`------- Duração: ${finalDateTime.diff(initialDateTime, 'seconds')} segundos ----------------------------------`)
      break;
    }
    let end = moment()
    console.log(`------- Duração: ${end.diff(start, 'seconds')} segundos ----------------------------------`)
  }
/*     slugs.forEach(cia => {
      consult(cpf, placa, chassi, cia)          
    }) */
}

/* initial() */