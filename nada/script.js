const scenes = [

{
img:"/nada/assets/ex1.jpeg",
text:"Excitement"
},

{
img:"/nada/assets/ex2.jpeg",
text:"P.S. - I wish we completed this movie, you would understand this reference then"
},

{
img:"/nada/assets/ex3.jpeg",
text:"(story soft launch, I called it then)"
},

{
img:"/nada/assets/ex4.jpeg",
text:"So cute, I wish we could go back to this time"
},

{
img:"/nada/assets/ex5.jpeg",
text:"I'd let a thousand more bikes get stolen if it meant one more night like this"
},

{
img:"/nada/assets/ex6.jpg",
text:"I talked to my mom for 2 hours about you this night coz you kissed me on the cheek haha"
},

{
img:"/nada/assets/ex7.jpeg",
text:"Well I'm no artist but still, I tried to recreate it (sorry I skipped our first kiss on 2nd Nov, there's no photos and it's too hard to draw:))"
},

{
img:"/nada/assets/ex8.jpeg",
text:"Our first snow!!"
},

{
img:"/nada/assets/ex9.jpg",
text:"'Beautiful things don't ask for attention'"
},

{
img:"/nada/assets/ex10.jpg",
text:"Honourable mention. Absolutely crazy, this needs to be remembered :D"
},

{
img:"/nada/assets/ex11.jpeg",
text:"I was so happy"
},

{
img:"/nada/assets/ex12.webp",
text:"If it is meant to be, it will be. In some lifetime or the other."
}

]

function openModal(i){

const modal=document.getElementById("modal")
const content=document.getElementById("modal-content")

content.innerHTML=`
<img src="${scenes[i].img}">
<p>${scenes[i].text}</p>
`

modal.style.display="flex"

modal.onclick=()=>{
modal.style.display="none"
}

}


/* valentine buttons */

let yesSize=1
let noSize=1

const yesBtn=document.getElementById("yesBtn")
const noBtn=document.getElementById("noBtn")
const result=document.getElementById("result")
const heartsContainer=document.querySelector(".hearts-container")

const emojis=["💗","🦝"]

noBtn.onclick=()=>{

noSize-=0.1
yesSize+=0.1

noBtn.style.transform=`scale(${noSize})`
yesBtn.style.transform=`scale(${yesSize})`

}

yesBtn.onclick=()=>{

result.innerHTML="yay! 🦝❤️"

for(let i=0;i<20;i++){

setTimeout(()=>{

const heart=document.createElement("div")
heart.classList.add("heart")

heart.innerHTML=emojis[Math.floor(Math.random()*emojis.length)]

heart.style.left=Math.random()*100+"%"

heartsContainer.appendChild(heart)

setTimeout(()=>{
heart.remove()
},2000)

}, i*120) // delay between each emoji

}

}

