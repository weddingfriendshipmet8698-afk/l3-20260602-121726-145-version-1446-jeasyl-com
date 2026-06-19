(function(){
function q(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function ready(fn){if(document.readyState!=="loading"){fn()}else{document.addEventListener("DOMContentLoaded",fn)}}
ready(function(){
var nav=document.querySelector(".nav-links"),toggle=document.querySelector(".mobile-toggle");
if(toggle&&nav){toggle.addEventListener("click",function(){nav.classList.toggle("open")})}
var slides=q(".hero-slide"),dots=q(".hero-dot"),current=0,timer=null;
function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle("active",n===current)});dots.forEach(function(d,n){d.classList.toggle("active",n===current)})}
if(slides.length>1){dots.forEach(function(d,n){d.addEventListener("click",function(){show(n);if(timer)clearInterval(timer);timer=setInterval(function(){show(current+1)},5200)})});timer=setInterval(function(){show(current+1)},5200)}
q("[data-filter-input]").forEach(function(input){input.addEventListener("input",function(){var root=input.closest("[data-filter-root]")||document;var term=input.value.trim().toLowerCase();q(".movie-card",root).forEach(function(card){var text=(card.getAttribute("data-search")||card.textContent||"").toLowerCase();card.style.display=!term||text.indexOf(term)>-1?"": "none"})})});
var globalInput=document.getElementById("globalSearch"),result=document.getElementById("searchResults");
if(globalInput&&result&&window.SEARCH_INDEX){var render=function(){var term=globalInput.value.trim().toLowerCase();var list=window.SEARCH_INDEX.filter(function(m){return !term||(m.t+" "+m.y+" "+m.g+" "+m.c+" "+m.tags).toLowerCase().indexOf(term)>-1}).slice(0,80);if(!list.length){result.innerHTML='<div class="empty-result">没有找到匹配影片</div>';return}result.innerHTML=list.map(function(m){return '<a class="movie-card" href="'+m.u+'" data-search="'+e(m.t+" "+m.y+" "+m.g+" "+m.c+" "+m.tags)+'"><div class="poster"><img src="'+m.img+'" alt="'+e(m.t)+'" loading="lazy"><span class="badge">'+e(m.y)+'</span></div><div class="card-body"><h3 class="card-title">'+e(m.t)+'</h3><p class="card-text">'+e(m.o)+'</p><div class="card-meta"><span>'+e(m.c)+'</span><span>'+e(m.g)+'</span></div></div></a>'}).join("")};globalInput.addEventListener("input",render);render()}
});
function e(s){return String(s||"").replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
window.initMoviePlayer=function(src){
var video=document.getElementById("moviePlayer"),layer=document.querySelector(".play-layer"),button=document.querySelector("[data-play]");
if(!video)return;
var started=false,hlsObj=null;
function start(){
if(started){var p=video.play();if(p&&p.catch)p.catch(function(){});return}
started=true;
if(video.canPlayType("application/vnd.apple.mpegurl")){video.src=src}
else if(window.Hls&&window.Hls.isSupported()){hlsObj=new Hls({maxBufferLength:30});hlsObj.loadSource(src);hlsObj.attachMedia(video)}
else{video.src=src}
if(layer)layer.classList.add("hidden");
video.controls=true;
var play=video.play();if(play&&play.catch)play.catch(function(){});
}
if(layer)layer.addEventListener("click",start);
if(button)button.addEventListener("click",start);
video.addEventListener("click",function(){if(!started)start()});
}
})();