let canvas=document.getElementById("particles");let ctx=canvas.getContext("2d");const min_particles=200;const max_particles=500;let num_particles;const speed_min=0.00004;const speed_max=0.00012;const size_min=1;const size_max=4;const alpha_max=0.5;const lifetime_min=5000;const lifetime_max=7000;const gravity=canvas.getAttribute("gravity")*0.000075;let particles=[];let now=performance.now();function clamp(number,min,max){return Math.min(Math.max(number,min),max);}
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;num_particles=clamp(window.innerWidth*0.5,min_particles,max_particles);}
window.addEventListener("resize",resize);resize();function rand(min,max){return Math.random()*(max-min)+min;}
class c_particle{constructor(){let ang=rand(0,Math.PI*2.0);this.cos=Math.cos(ang);this.sin=Math.sin(ang);let random_offset=rand(0,1);this.x=this.cos*random_offset;this.y=this.sin*random_offset;this.alpha=0;this.size=rand(size_min,size_max);this.speed_x=rand(speed_min,speed_max);this.speed_y=rand(speed_min,speed_max)/8;this.lifetime=rand(lifetime_min,lifetime_max);this.faded_time=null;this.dead_time=null;this.alive=true;}
move(delta){this.x+=(this.speed_x*this.cos)*delta;this.y+=((this.speed_y*this.sin)+(gravity))*delta;}
fade(){let alpha_step=0.01;if(!this.dead_time){if(this.faded_time==null){this.alpha+=alpha_step;if(this.alpha>=alpha_max){this.faded_time=now;this.alpha=alpha_max;}}else{let time_alive=now-this.faded_time;if(time_alive>this.lifetime){this.dead_time=now;}}}else{this.alpha-=alpha_step;if(this.alpha<=0){this.alive=false;this.alpha=0;}}}
bounds_check(){if(this.outside_screen()){this.alive=false;}}
draw(delta){ctx.globalAlpha=this.alpha;let pos=this.get_position();ctx.fillRect(Math.round(pos.x),Math.round(pos.y),Math.round(this.size),Math.round(this.size));}
update(delta){this.move(delta);this.fade();this.bounds_check();this.draw(delta);}
get_position(){let real_x=(canvas.width*this.x)/2;let real_y=(canvas.height*this.y)/2;let x=canvas.width/2+real_x;let y=canvas.height/2+real_y;return{x:x,y:y};}
outside_screen(){return this.x>1.1||this.x<-1.1||this.y>1.1||this.y<-1.1;}}
function fill_particles(){for(let i=particles.length;i<num_particles;i++){particles.push(new c_particle());}}
let lastUpdate=now;function update(){now=performance.now();let delta=now-lastUpdate;lastUpdate=now;fill_particles();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#ffffff";for(let i=particles.length-1;i>=0;i--){particles[i].update(delta);if(!particles[i].alive){particles.splice(i,1);}}
requestAnimationFrame(update);}
update();function open_popup(elem){if(elem.classList.contains("popup-open"))
return;for(let popup of document.getElementsByClassName("popup")){if(popup==elem)
continue;close_popup(popup,true);}
let forms=elem.getElementsByTagName("form");for(let form of forms){for(let child of form.childNodes){if(child.type=="submit")
continue;child.value="";}}
elem.classList.remove("popup-faded");let main=document.getElementById("main");setTimeout(()=>{elem.classList.add("popup-open");main.style.transform="translateY(-130px)";elem.style.transform="translateY(-110px)";elem.style.zIndex="999";},5)}
function close_popup(elem,keep_main_up){if(!elem.classList.contains("popup-open"))
return;elem.classList.remove("popup-open");if(!keep_main_up){let main=document.getElementById("main");main.style.transform="";}
elem.style.transform="";elem.style.zIndex="";setTimeout(()=>{elem.classList.add("popup-faded");},200);}
function toggle_popup(elem){let open=elem.classList.contains("popup-open");if(open){close_popup(elem);}else{open_popup(elem);}}
function utc_convert(date){return new Date(date+" UTC").toLocaleString().toLowerCase();}
function chunk_array_into_groups(input,size){let output=[];for(let i=0;i<input.length;i+=size)
output.push(input.slice(i,i+size).reverse());return output;}
let table_items={};async function generate_table(url,name,item_callback,page_callback,options){try{let table=document.getElementById(`${name}-table`);if(!table_items[name]||(options&&options.reloading)){let resp=await fetch(url);table_items[name]=await resp.json();}
let max_items=20;if(options&&options.max_items){max_items=options.max_items;}
let pages=chunk_array_into_groups(table_items[name],max_items);let current_page=parseInt(table.getAttribute("page"));if(!current_page){table.setAttribute("page",0);current_page=parseInt(table.getAttribute("page"));}
{if(document.getElementsByClassName(`${name}-pages`).length==0){let page_elem=document.createElement("div");page_elem.className=`${name}-pages table-pages`;table.insertAdjacentElement("afterend",page_elem);}
for(let page_elem of document.getElementsByClassName(`${name}-pages`)){page_elem.innerHTML="";const add_page=i=>{let page_div=document.createElement("div");page_div.innerHTML=i+1;if(i==current_page){page_div.classList.add("selected-page");}
page_div.onclick=function(){table.setAttribute("page",i);page_callback();}
page_elem.insertAdjacentElement("afterbegin",page_div);page_elem.appendChild(page_div);}
const add_ellipses=i=>{let page_div=document.createElement("div");page_div.innerHTML="...";page_elem.insertAdjacentElement("afterbegin",page_div);page_elem.appendChild(page_div);}
if(pages.length<=5){for(let i=0;i<pages.length;i++){add_page(i);}}else{add_page(0);if(current_page>=3){add_ellipses();}
let i=current_page-2;let drawn=0;while(drawn<5&&i<pages.length-1){if(i>0&&i<pages.length-1){add_page(i);drawn++;}
i++;}
if(current_page<pages.length-2){add_ellipses();}
add_page(pages.length-1);}}}
let items=pages[current_page]?pages[current_page]:[];if(items.length>0){table.style.display="";let elem=document.getElementsByClassName(`${name}-list`)[0];elem.innerHTML="";let existing=document.getElementsByClassName(`${name}-item`);let done_ids=Array.from(existing).map(e=>e.getAttribute("item-id"));for(let item of items){if(done_ids.indexOf(item["id"].toString())!=-1)
continue;let row=document.createElement("tr");row.className=`${name}-item`;row.setAttribute("item-id",item["id"]);row.style="border-bottom: 1px solid rgba(255,255,255,0.3)";row.innerHTML=item_callback(item);elem.insertBefore(row,elem.firstChild);}}else{table.style.display="none";}
return items;}catch(e){console.log(e);}}
async function post_url(url,form_object,method){try{let form=new FormData();for(let key in form_object){form.append(key,form_object[key]);}
let resp=await fetch(url,{method:"POST",body:form})
if(method=="json")
return await resp.json();else
return await resp.text();}catch(e){return false;}}
function user_elem(username,type,colour,userid=null){const add_colour=()=>`class="user-${type}" ${(type == "vip" || type == "admin") && colour ? `style="color: ${colour}"` : ""}`;if(userid){return`<a href="/users/${userid}" ${add_colour()}>${username}</a>`;}else{return`<span ${add_colour()}>${username}</span>`;}}
function redirect(path){document.body.style.animation="fade_out 0.3s";location.href=path;}
document.onclick=function(e){e=e||window.event;var element=e.target||e.srcElement;if(element.tagName=='A'&&!element.classList.contains("no-fade")){redirect(element.href);return false;}};window.addEventListener("load",()=>document.body.style.animationName="fade_in");function page_hidden(){return document.hidden||document.msHidden||document.webkitHidden||document.mozHidden;}
let newest=0;async function update_shoutbox(){let shoutbox=document.getElementById("shoutbox");if(!shoutbox)
return;let hidden=shoutbox.classList.contains("shoutbox-hidden");if(hidden)
return;if(newest!=0&&page_hidden())
return;let messages=await post_url("/shoutbox/get_messages",{newest:newest},"json");if(!messages||messages.length==0)
return;newest=parseInt(messages[0]["id"]);let elem=document.getElementById("shoutbox-messages");let new_message=false;for(let message of messages.reverse()){let id=`message-${message.id}`;if(document.getElementById(id))
continue;let username=message["username"];let type=message["type"];let colour=message["colour"];let userid=message["userid"];if(!username){username="anon";if(message["anonid"]){username=`anon-${message["anonid"]}`;}
type="none";}
let message_div=document.createElement("div");message_div.id=id;message_div.className="shoutbox-message";if(message["bot"]){message_div.innerHTML=`<span class="user-bot">coinbot</span>: ${username} ${message["message"]}`;}else{message_div.innerHTML+=`${user_elem(username, type, colour, userid)}: ${message["message"]}`;}
elem.appendChild(message_div);new_message=true;}
if(new_message){elem.scrollTop=elem.scrollHeight;}}
function shake(){let input=document.getElementById("shoutbox-message-input");input.style.animation="";setTimeout(()=>{input.style.animation="shake 0.75s";},15);}
async function send_message(){let elem=document.getElementById("shoutbox-message-input");let message=elem.value;elem.value="";let resp=await post_url("/shoutbox/send_message",{message:message});if(resp=="success"){update_shoutbox();}else{shake();}}
function open_shoutbox(){let shoutbox=document.getElementById("shoutbox");shoutbox.classList.toggle("shoutbox-hidden");update_shoutbox();let form=document.getElementById("shoutbox-form");form.classList.toggle("hidden");}
update_shoutbox();setInterval(update_shoutbox,2000);