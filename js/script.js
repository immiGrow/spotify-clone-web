console.log("Script is initializing...")
let currentSong=new Audio()
let play=document.getElementById("play")
let songs;
let current_folder;
function formatTime(seconds) {
  if(seconds!=""){
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  }
  return "00:00"
}



async function getAllSongs(folder){
  current_folder=folder
  console.log("folder name",folder)
    let songs_arr=[];
    let req=await fetch(`/songs/${current_folder}`)
    let res=await req.text()
 
    let div=document.createElement("div")
    div.innerHTML=res
   let as= div.getElementsByTagName("a")
    
    let songs= Array.from(as).slice(1,)

  
    songs.forEach((element,index) => {


          console.log("element",element)
          let song=element.href.split("/")[5].replaceAll("%20"," ")
          
          let song_name=song.slice(0,String(song).length-4)
          console.log(song_name)
            
        if(song_name!="info." && song_name !="cover"){
          
          songs_arr.push(song_name)
        }
                

    });
    console.log("songs_arr",songs_arr)
    if(document.getElementById("current-song-name").innerHTML.length==0){
      
      document.getElementById("current-song-name").innerHTML=songs_arr[0]
    }
    return songs_arr;
}

const playMusic=async(track)=>{

currentSong.src=`http://127.0.0.1:3000/songs/${current_folder}/${track}.mp3`
currentSong.play()
play.src="svg/pause.svg"
document.getElementById("current-song-name").innerHTML=track
document.getElementById("artist-name").innerHTML="Arjit Singh"

}

const populateSongs=(songs)=>{
   let songs_list= document.querySelector(".songs-list")
   console.log("Songs are",songs)

   songs_list.innerHTML=""


   songs.forEach(song_name => {

       let song_item=` <div class="song-item">
                    <img class="invert" src="svg/music.svg" alt="music">
                    <div class="song-name">${song_name}</div>
                    <div class="play-icon">
                        <div class="play-button">
                        <img src="svg/play-button.svg" alt="Play-button">
                    </div>
                    </div>
                  </div>`
   songs_list.insertAdjacentHTML("beforeend",song_item)
   });

   let song_items= document.getElementsByClassName("song-item");

  // listing all the songs in library section for playing
  Array.from(song_items).forEach((item,index,array)=>{
    array[index].addEventListener("click",()=>{
      //console.log("http://127.0.0.1:3000/songs/"+item.innerText+".mp3")
      playMusic(item.innerText)

    })
  })
}

async function displayAlbums(){
    let playlist_arr=[];
    let req=await fetch(`/songs/`)
    let res=await req.text()

    let div=document.createElement("div")
    div.innerHTML=res
   let as= div.getElementsByTagName("a")
  let anchors= Array.from(as).slice(1,)
  anchors.forEach(e=>{
      let playlist_name=e.href.split("/songs/")[1].slice(0,-1)
 
      playlist_arr.push(playlist_name)
  })



  for (let index = 0; index < playlist_arr.length; index++) {
    let playlist = playlist_arr[index];

    let req=await fetch(`/songs/${playlist}/info.json`)
    let res=await req.json()

    document.querySelector(".spotify-playlists").innerHTML+=`<div class="playlist-card">
                        <div class="playlist-items">

                        <div class="playlist-img">
                            <img class="playlist-card-img" src="http://127.0.0.1:3000/songs/${playlist}/cover.jpg" alt="${res.title}">
                    <img class="spotify-card-logo invert" src="spotify-icon.svg" alt="Spotify">
                    <div class="play-button spotify-play-button play-btn">
                        <img src="svg/play-button.svg" alt="Play-button">
                    </div>

                        </div>
                        <div class="playlist-lines">
                            <h2 class="playlist-headline">${res.title}</h2>
                            <h3>${res.description}... </h3>
                        </div>
                        </div>
                            
                    </div>`

    
  }
  

    // adding event listener to playlist-card
  Array.from(document.getElementsByClassName("playlist-card")).forEach(item=>{
    item.addEventListener("click",async(e)=>{
     let album_name= e.currentTarget.getElementsByClassName("playlist-headline")[0].innerHTML
      songs=await getAllSongs(album_name)
     
      populateSongs(songs)
      playMusic(songs[0])
      document.querySelector(".left-section").style.transform="translateX(0)"
      document.querySelector(".left-section").style.zIndex=10
    })
  })



}

async function main() {
   
// displaying all the albums
  await displayAlbums()

// get all songs from the folder  

    songs=await getAllSongs("Slowed X Reverb songs")
    populateSongs(songs)
  let song_items= document.getElementsByClassName("song-item");

  // listing all the songs in library section for playing
  Array.from(song_items).forEach((item,index,array)=>{
    array[index].addEventListener("click",()=>{
     // console.log("http://127.0.0.1:3000/songs/"+item.innerText+".mp3")
      playMusic(item.innerText)

    })
  })





// adding event listner to play song
  play.addEventListener("click",()=>{
  if(currentSong.src==""){
    currentSong.src=`http://127.0.0.1:3000/songs/${current_folder}/${songs[0]}.mp3`

currentSong.play()

 play.src="svg/pause.svg"
  }
    if(currentSong.paused){
      currentSong.play()
      play.src="svg/pause.svg"
    }
    else{
      currentSong.pause()
      play.src="svg/play-button.svg"
    }
  })

  currentSong.addEventListener("timeupdate",()=>{
document.querySelector(".current-song-time").innerHTML=formatTime(currentSong.currentTime)
document.querySelector(".current-song-duration").innerHTML=formatTime(currentSong.duration)
document.querySelector(".seekbar-circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%"
let next_song_index=songs.indexOf(document.getElementById("current-song-name").innerHTML)

if(currentSong.currentTime==currentSong.duration && (next_song_index+1)<songs.length){
  playMusic(songs[next_song_index+1])
  
}
else if(next_song_index==undefined){
  console.log("No songs more available now!!!")
}


  })

document.querySelector(".seekbar").addEventListener("click",e=>{
  let current_cursor=e.offsetX
  let current_device_width=e.target.getBoundingClientRect().width

  document.querySelector(".seekbar-circle").style.left=(current_cursor/current_device_width)*100+"%"
  document.querySelector(".current-song-time").innerHTML=formatTime(currentSong.duration*(current_cursor/current_device_width))
  currentSong.currentTime=currentSong.duration*(current_cursor/current_device_width)
  
})

    // On clicking the music must play functionality
    // currentMusic functionality
    // Only one music play at a time
    // playlist functionality


    // hamburger-menu functionality
    document.querySelector(".hamburger-menu").addEventListener("click",()=>{
      document.querySelector(".left-section").style.transform="translateX(0)"
      document.querySelector(".left-section").style.zIndex=10


       
    })
    document.querySelector(".close-icon").addEventListener("click",()=>{
      document.querySelector(".left-section").style.transform="translateX(-101%)"
      document.querySelector(".left-section").style.zIndex=10



    })

    // previous and next buttons functionality
  let previous=document.querySelector("#previous")
  previous.addEventListener("click",()=>{
    let c_song_index=songs.indexOf(document.querySelector("#current-song-name").innerHTML)
    if(c_song_index-1!=-1){

      playMusic(songs[c_song_index-1])
    }
  })
  let next=document.querySelector("#next")
  next.addEventListener("click",()=>{
    
    let c_song_index=songs.indexOf(document.querySelector("#current-song-name").innerHTML)
    if(c_song_index+1<songs.length){

      playMusic(songs[c_song_index+1])
    }
  })

  // adding event to volume
  let volume=  document.querySelector("#song-volume")
volume.addEventListener("change",(e)=>{
    currentSong.volume=parseInt(e.target.value)/100
  })

  // volume mute
  document.getElementById("volume-min").addEventListener("click",()=>{
    currentSong.volume=parseInt(0)
    volume.value=0

  })
  // volume max
  document.getElementById("volume-max").addEventListener("click",()=>{
    currentSong.volume=parseInt(1)
    volume.value=100

    
  })
    
}


main()