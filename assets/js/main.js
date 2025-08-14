const $ = document.querySelector.bind(document)

HTMLElement.prototype.on = function(event, callback){
   return this.addEventListener(event, callback)
}

const miniPlayer            = $('.mini-player')
const capa                  = $('.mini-player .capa')
const imagemDoCD            = $('#imagem-do-cd')
const elementoNomeDaMusica  = $('#nome-da-musica')
const elementoNomeDoArtista = $('#nome-do-artista')
const barraDeControle       = $('#barra-de-controle')
const temporizadorAtual     = $('#temporizador-atual')
const temporizadorFinal     = $('#temporizador-final')
const botaoPlayPause        = $('#botao-play-pause')
const botaoPlayPauseIcone   = $('#botao-play-pause i')
const botaoVoltarMusica     = $('#botao-voltar-musica')
const botaoPularMusica      = $('#botao-pular-musica')
const inputFile             = $('input[type=file]')
const agulhaDeVinil          = $('.agulha-de-vinil')



let timer = ''
let contador = 0
let status = false
let listaDeReproducao = []
let rotatacao = 0

let audio = new Audio()




inputFile.on('change', uploadMusicas)

// Faz o opload do arquivo de áudio.
function uploadMusicas(){
    let file = inputFile.files[0]
        // Carrega a música
         carregarMusica(file) 
        
        // Adiciona as músicas a lista de reprodução 
        for( let musica of inputFile.files){
             listaDeReproducao.push(musica)
        }
        
}


function carregarMusica( blob, callback){
  
    let reader = new FileReader()
        reader.onload = function(){
            if( !status )
            {
             audio.src = reader.result
             carregarCapa(blob)
            }
        }
        reader.readAsDataURL(blob)
        
    
    audio.onloadstart = ()=>{
       console.info('Carregando audio…')
    }
    audio.onloadedmetadata = function(){
      if(!status)
      {
       mostrarInformacoesDeTempo()
       console.info('Audio carregado.')
       status = true
         callback ? callback() : null
    }
}
    
    
}

function reproduzirMusica(){
      audio.play()
      botaoPlayPauseIcone.className = 'bx bx-pause'
      atualizarDados()
      girarDisco()
}

function pausarMusica(){
      audio.pause()
      botaoPlayPauseIcone.className = 'bx bx-play'
      pararAtualizacaoDeDados()
      pararDisco()  
}
  
function playPause(){
  // Reproduz a música, caso já tenha sido carregada.
   if( audio.paused && status === true){
      reproduzirMusica()
   }else{
      pausarMusica()
   }
}

function pularMusica(){
  // Verifica se a próxima música não é a última, caso seja, volta a tocar a primeira.
    contador < listaDeReproducao.length-1? 
                                            contador++ : 
                                            contador = 0
    // Carrega a próxima música
    status = false
    pararDisco()
    carregarMusica(listaDeReproducao[contador], function() {
    rotatacao = 0
    reproduzirMusica()
    
})
    
}
function voltarMusica(){
  // Verifica se a música anterior não é a primeira, caso seja, volta a tocar a última.
    contador - 1 < 0?
                contador = listaDeReproducao.length-1 :
                contador--
    // Carrega a música anterior
    status = false
    pararDisco()
    carregarMusica(listaDeReproducao[contador], function(){
         rotatacao = 0
         reproduzirMusica()
        
    })
}


botaoPularMusica.on('click', ()=>{
  status ? pularMusica() : null
  
    let icone = botaoPularMusica.querySelector('i')
        icone.animate([{
            transform: 'translateX(0) scale(1.5)'
        },{
            transform: 'translateX(5px) scale(1.5)'
        },{
            transform: 'translateX(0) scale(1.5)'
        },{
            transform: 'translateX(0) scale(1)'
        }], {
           duration: 700,
           easing: 'ease-in'
        })
})


botaoPlayPause.on('click', playPause)
botaoVoltarMusica.on('click', ()=>{
    
  status ? voltarMusica() : null
  
  let icone = botaoVoltarMusica.querySelector('i')
        icone.animate([{
            transform: 'translateX(0) scale(1.5)'
        },{
            transform: 'translateX(-5px) scale(1.5)'
        },{
            transform: 'translateX(0) scale(1.5)'
        },{
            transform: 'translateX(0) scale(1)'
        }], {
           duration: 700,
           easing: 'ease-in'
        })
  
})



// Carregamento de capa.
function carregarCapa( file ){
  
   jsmediatags.read(file, {
        onSuccess : function(tag){
            let picture = tag.tags.picture
            // Verifica se existe uma imagem de capa.
            if( picture ){
              let base64String = ''
              
              // Converte os numeros em caracteres
              for( let i = 0; i < picture.data.length; i++){
                  base64String += String.fromCharCode(picture.data[i])
              }
              
              // Cria uma imagem de base64
              let imagemBase64 = `data:${picture.format};base64,${btoa(base64String)}`
               
               //adicona a imagem ao CD
               imagemDoCD.src = imagemBase64
               // Muda a cor de fundo do mini player
               miniPlayer.style.setProperty('--url', `url(${imagemBase64})`)
               
            }
            
            let {title:titulo, artist:artista} = tag.tags
            // Atualiza o nome e o título da música.
            atualizarNomeEArtista(titulo, artista)
        }, 
           onError: function(erro){
               atualizarNomeEArtista(file.name,'Artista desconhecido')
               
               
               //adicona a imagem ao CD
               imagemDoCD.src = 'assets/img/capa.jpg'
               // Muda a cor de fundo do mini player
               miniPlayer.style.setProperty('--url', `url('capa.jpg')`)  
        }
        
   })
}

barraDeControle.on('input', ()=>{
    audio.currentTime = barraDeControle.value
    
    atualizarBarraDeControle( barraDeControle.value, audio.duration)
    mostrarInformacoesDeTempo()
    
})

barraDeControle.on('change', ()=>{
    audio.currentTime = barraDeControle.value
    
    atualizarBarraDeControle( barraDeControle.value, audio.duration)
    mostrarInformacoesDeTempo()
    
})



async function converterBase64ParaBlob(base64){
    let resposta = await fetch(base64)
    return await resposta.blob()
}



function atualizarNomeEArtista(nome, artista){
   elementoNomeDaMusica.innerHTML = `<marquee behavior="scroll">${nome}</marquee>`
   elementoNomeDoArtista.innerHTML = artista || 'Artista desconhecido'
   
   document.title = nome 
}

function atualizarDados(){
    timer = setInterval(()=>{
       mostrarInformacoesDeTempo()
    })
}


function mostrarInformacoesDeTempo(){
         let tempoAtual = audio.currentTime
         let tempoFinal = audio.duration
         
         temporizadorAtual.innerHTML = formatarTempo(tempoAtual)
         temporizadorFinal.innerHTML = formatarTempo(tempoFinal)
         
         atualizarBarraDeControle(tempoAtual, tempoFinal)
         
         if( audio.ended){
           pararAtualizacaoDeDados()
           pularMusica()
         }
}

function pararAtualizacaoDeDados(){
   clearInterval(timer)
}


function atualizarBarraDeControle(valor, maximo){
   maximo = Math.round(maximo)
   
   let progresso = (100/maximo) * Math.round(valor) + '%'
   
   barraDeControle.style.setProperty('--progresso', progresso)
   
   barraDeControle.setAttribute('max', maximo)
   barraDeControle.value = Math.round(valor)
   
}

function formatarTempo(numero){
   
   var adicionarZero = (num) =>{
      return num < 10 ? '0'+ num : num
   }
   
   let hor = Math.floor(numero / 3600 %24) ||0
   let min = Math.floor(numero/60) % 60 || 0
   let seg = adicionarZero(Math.floor(numero)%60) || 0
   
   if(hor === 0){
      return min+':'+seg // Formato 0:00
   }
   
   return hor+':'+ adicionarZero(min) + ':'+seg // Formato 0:00:00
}

let timer2 = ''

function girarDisco(){
    agulhaDeVinil.classList.add('tocar')
    
     timer2 = setInterval(()=>{
          rotatacao++
          rotatacao = rotatacao%360
          
          capa.style.setProperty('transform', `rotate(${rotatacao}deg)`)
     }, 27.7)
}

function pararDisco(){
    agulhaDeVinil.classList.remove('tocar')
    clearInterval(timer2)
}