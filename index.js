/* const puppeteer = require('puppeteer') */
const moment = require('moment')
const readline = require('readline')
const axios = require('axios')

async function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

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

/* 
async function consult(cpf, placa, finalChassi, cia) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 0
    })

    const page = await browser.newPage()
    await page.setCacheEnabled(false)
    await page.goto(`https://www.abraseuatendimento.com.br/#/${cia.slug}/passo1`)
    await page.type('#inserir-cpf-input', cpf, { delay: 100 })
    
    await page.type('.md-datepicker-input', date, { delay: 100 })
    await page.keyboard.press('Escape')
    
    await sleep(1000)

    await page.click('#iniciar-atendimento-btn')
    
    await sleep(2000)
  
    const check = await page.$('#aceitar-apolice-btn')
  
    if(!check) {
      await page.waitForSelector((cia.slug != 'porto') ? '#input_4' : '#placa-input', {
        timeout: 0
      })

      await page.type((cia.slug != 'porto') ?'#input_4' : '#placa-input', placa, { delay: 100 })
    
      await page.type((cia.slug != 'porto') ? '#input_5' : '#sufixo-chassi-input', finalChassi, { delay: 100 })
      
      await page.click('#iniciar-atendimento-btn')
    
      await sleep(100)
    
      const confirm = await page.$('.toolbar-dialog')
    
      if(confirm) {
        await browser.close()
        return resolve({ cia, error: 'not-found' })
      }
  
      const reCheck = await page.$('#aceitar-apolice-btn')
  
      if(!reCheck) {
        await browser.close()
        return resolve({ cia, error: 'not-found' })
      }

      await page.screenshot({ path: `${cpf}-${cia.cia}.jpg` })
      await browser.close()
      return resolve({ cia })
    }

    await page.screenshot({ path: `${cpf}-${cia.cia}.jpg` })
    await browser.close()
    return resolve({ cia })
  })  
} 
*/

async function consult(cpf, placa, cia) {
  return new Promise(async (resolve) => {
    const { data } = await axios.get(`https://oag.autoglass.com.br/atendimentos/api/web-app/apolices?CpfCnpj=${cpf}&DataSinistro=${date}&Placa=${placa}&Seguradora=${cia.slug}`)

    if(data.ApoliceNaoEncontrada) return resolve({ cia, error: 'not-found' })
    return resolve({ cia })
  })
}

async function initial() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  let cpf
  let placa
/*   let chassi */
  
  const question1 = () => {
    return new Promise((resolve, reject) => {
      rl.question('Qual o cpf do segurado? ', (answer) => {
        console.log(answer)
        cpf = answer
        resolve()
      })
    })
  }
  
  const question2 = () => {
    return new Promise((resolve, reject) => {
      rl.question('Qual a placa do veiculo? ', (answer) => {
        console.log(answer)
        placa = answer
        resolve()
      })
    })
  }

/*   const question3 = () => {
    return new Promise((resolve, reject) => {
      rl.question('Qual os 6 ultimos digitos do chassi? ', (answer) => {
        console.log(answer)
        chassi = answer
        resolve()
      })
    })
  } */
  
  console.log('Opa, vamos começar')
  await question1()
  await question2()
  rl.close()

  console.log("Certo, estou pesquisando, agora é só esperar ;)")
  const initialDateTime = moment()
  for (const cia of cias) {
    let start = moment()
    console.log('Pesquisando na', cia.cia);
    const response = await consult(cpf, placa, cia)
    if(!response.error) {
      console.log(`Opaa, achei já está na seguradora: ${response.cia.cia}`)
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

initial()