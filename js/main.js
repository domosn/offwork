let cards=document.getElementsByClassName('card');
let fronts=document.getElementsByClassName('front');
let backs=document.getElementsByClassName('back');
let gains=document.getElementsByClassName('gain');

let gap=[1];
let frames=[0];
let ani=new Array();
let shows=new Array();

let itemData = [];
let feedBack='';
let getCard='';

$(function(){
	getData({'evt': 'read'});
	keyDetection();

	$('.start').click(function(){
		document.getElementsByClassName('mask')[0].style.display="none";

		initial();
	
		shuffle(itemData);

		tempHideAll();

		for(i = 0; i < backs.length; i++){
			backs[i].innerHTML = i + 1;
		}
		
		for(i = 0; i < fronts.length; i++){
			fronts[i].setAttribute("data-type", itemData[i]);
			fronts[i].innerHTML = itemData[i];
		}
		
		for(i = 0; i < cards.length; i++){
			cards[i].onclick=function cardClick(){
				gap[0]=1;
				document.getElementById("wall").style.display="block";

				if(shows.indexOf(this) == -1 && this.style.animationName != "opa"){
					shows.push(this);
					ani[0]=setInterval(fade, 10, this, 0)
					frames[0]=0

					this.nextSibling.classList.add("card_mask");
				} else {
					document.getElementById("wall").style.display="none";
				}
			}
		}
	});

	$('.setting').click(function(){
		document.querySelector('.mask').style.display='flex';
		setTimeout(function(){
			$('.mask').addClass('show');
			document.querySelector('.settingForm').style.top = '-5%';
		}, 100);
	});

	$('.save').click(function (){
		let itemArr = [];
		let newNum = 0;
		$('input[name=items]').each(function() {
			if ($(this).val() !== '') {
				newNum++;
				itemArr.push($(this).val());
				$(this).parent().prev().children().text(newNum);
			} else if($(this).val() == ''){
				$(this).parent().parent().remove();
			}
		});
		
		if(newNum < 2){
			alert('項目不可少於2個');
			document.querySelector('tbody').innerHTML=feedBack;
			return;
		}

		let data = {
			'evt': 'write',
			'items': JSON.stringify(itemArr)
		}
		saveData(data);
	});

	$('.close').click(function(){
		document.querySelector('.settingForm').style.top = '-10%';
		// $('.mask').removeClass('show');
		setTimeout(function(){
			$('.mask').removeClass('show');
		}, 100);
		setTimeout(function(){
			document.querySelector('.mask').style.display='none';
			document.querySelector('tbody').innerHTML=feedBack;
		}, 300);
	});

	$('.addItem').click(function(){
		let lastNum = parseFloat($('tbody tr:last .serial').text());

		if(isNaN(lastNum)){
			lastNum = 0;
		}

		if(lastNum > 7){
			alert("項目不可超過8個");
			return;
		}

		let str = '<tr>';
		str += '<td><span class="serial">' + (lastNum + 1) + '</span></td>';
		str += '<td><input type="text" value="" name="items" placeholder="請輸入今天想做的事項"></td>';
		str += '</tr>';
		$('tbody').append(str);

		let inputEle = document.querySelectorAll('input[type=text]');
		inputEle[inputEle.length - 1].focus();
	});
});

function getData(data) {
	$.ajax({
		type: "get",
		url: "https://script.google.com/macros/s/AKfycby32I1QxNbn2PflQcjHnQYv439YL7ivaQ-U3OuTUb2LeBjc9kQ/exec",
		data: data,
		dataType: "JSON",
		success: function (response) {
			feedBack='';
			getCard='';
			itemData.length=0;
			for(i = 0; i < response.data.items.length; i++){
				feedBack += '<tr>';
				feedBack += '<td><span class="serial">' + (i + 1) + '</span></td>';//response.data.id[i]
				feedBack += '<td><input type="text" value="' + response.data.items[i] + '" name="items" placeholder="請輸入今天想做的事項"></td>';
				feedBack += '</tr>';

				getCard += '<div class="contain"><div class="card"><div class="front">' + response.data.items[i] + '</div><div class="back"></div></div><div class="gain"></div></div>';
				itemData.push(response.data.items[i]);
			}
			document.querySelector('tbody').innerHTML=feedBack;
			document.querySelector('.wrap').innerHTML=getCard;
		}
	});
}

function saveData(data) {
	$.ajax({
		type: "get",
		url: "https://script.google.com/macros/s/AKfycby32I1QxNbn2PflQcjHnQYv439YL7ivaQ-U3OuTUb2LeBjc9kQ/exec",
		data: data,
		dataType: "JSON",
		success: function (response) {
			getData({'evt': 'read'});
			alert('更新成功');
		}
	});
}






function initial(){
	gap=[1];
	frames=[0];
	ani.length=0;
	shows.length=0;

	for(i=0;i<cards.length;i++){
		cards[i].removeAttribute('style');
		cards[i].childNodes[0].removeAttribute('style');
		cards[i].childNodes[1].removeAttribute('style');
		cards[i].nextSibling.classList.remove("card_mask");
	}
}



function continueTime() {
	if(shows.length>0){
		shows[0].nextSibling.classList.remove("card_mask");
		shows[1].nextSibling.classList.remove("card_mask");

		document.getElementsByClassName('mask')[0].style.display="none";

		shows[0].removeAttribute('style')
		shows[1].removeAttribute('style')
		document.getElementById("wall").style.display="block";
		ani[0]=setInterval(fade,10,shows[0],0)
		ani[1]=setInterval(fade,10,shows[1],1)

		shows.length=0;
	} else {
		document.getElementsByClassName('mask')[0].style.display="none";
	}
}









function overlay_close() {
    document.querySelector('.intro').style.bottom = '100%';
    setTimeout(function(){
        document.querySelector('.mask').style.display="none";
    }, 500);
    
}

function dialogBoxMsg(msg) {
	str="<div class='close_container'><span class='close' onclick='overlay_close()'></span></div><div class='ele_container'>"+msg+"</div></div>";

	document.querySelector('.intro').innerHTML=str;
    document.querySelector('.mask').style.display="flex";
    setTimeout(function(){
        document.querySelector('.intro').style.bottom = '0%';
    }, 100);
}










function shuffle(array){
	for(i=0; i < array.length ; i++){
		let seed = Math.floor(Math.random() * array.length);
		let temp = array[i];
		array[i] = array[seed];
		array[seed] = temp;
	}
	return array;
}

function tempShowAll(){
	document.getElementById("wall").style.display="block";
	for(i=0;i<cards.length;i++){
		document.getElementsByClassName("back")[i].style.display="none";
		document.getElementsByClassName("front")[i].style.display="flex";
	}
}

function tempHideAll(){
	document.getElementById("wall").style.display="none";
	for(i=0;i<cards.length;i++){
		if(!cards[i].nextSibling.classList.contains("card_mask")){
			document.getElementsByClassName("back")[i].style.display="flex";
			document.getElementsByClassName("front")[i].style.display="none";
		}
	}
}

function fade(obj, d){
	if(frames[d]==10){
		if(obj.childNodes[0].style.display=="none" || obj.childNodes[0].style.display==""){
			obj.childNodes[1].style.display="none";
			obj.childNodes[0].style.display="flex";
		} else {
			obj.childNodes[1].style.display="flex";
			obj.childNodes[0].style.display="none";
		}
	}

	if(frames[d]>=20){
		if(shows.length<1){
			document.getElementById("wall").style.display="none";
		} else {
			document.getElementById("wall").style.display="block";
		}

		clearInterval(ani[d])
		frames[d]=0;

	} else if(frames[d]>=10){
		gap[d]+=0.1
		obj.style.transform="scaleX("+gap[d]+")";
		frames[d]+=1
	} else{
		gap[d]-=0.1
		obj.style.transform="scaleX("+gap[d]+")";
		frames[d]+=1
	}
}

function keyDetection(){
	document.onkeypress = function (event){
		key = String.fromCharCode(event.which)
		if(key =='s'){
			tempShowAll();
		} else if(key =='c'){
			tempHideAll();
		}
	}

	// document.onkeyup = function (event){
	// 	key = String.fromCharCode(event.which)
	// 	if(key =='S'){//hide all cards
	// 		tempHideAll();
	// 	}
	// }

	document.onkeydown = function (event){
		key = event.key;
		if(key =='v'){//= ranking Show and Hide
			// let targetEle = document.getElementsByClassName('rank')[0];
			// if(targetEle.style.top == '-100%' || targetEle.style.top == '') {
			// 	ajaxRanking();
			// 	targetEle.style.top = '0%';
			// } else {
			// 	targetEle.style.top = '-100%';
			// }
		}
	}
}








/* typewriter effect es6 */
const keyTextDiv = document.querySelector(".keyText");
const cursorDiv = document.querySelector(".cursor");

const textArray = ["今天做什麼", "下班新鮮試", "su root", "password", "cd ./home/root"];
const typingDelay = 200;
const erasingDelay = 100;
const newTextDelay = 2000; // Delay between current and next text
let textArrayIndex = 0;
let charIndex = 0;

function write() {
	if (charIndex < textArray[textArrayIndex].length) {
		if (!cursorDiv.classList.contains("typing")) cursorDiv.classList.add("typing");
		keyTextDiv.textContent += textArray[textArrayIndex].charAt(charIndex);
		charIndex++;
		setTimeout(write, typingDelay);
	} else {
		cursorDiv.classList.remove("typing");
		setTimeout(backspace, newTextDelay);
	}
}

function backspace() {
	if (charIndex > 0) {
		if (!cursorDiv.classList.contains("typing")) cursorDiv.classList.add("typing");
		keyTextDiv.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
		charIndex--;
		setTimeout(backspace, erasingDelay);
	} else {
		cursorDiv.classList.remove("typing");
		textArrayIndex++;
		if (textArrayIndex >= textArray.length) textArrayIndex = 0;
		setTimeout(write, typingDelay + 1100);
	}
}

document.addEventListener("DOMContentLoaded", function () { // On DOM Load initiate the effect
	if (textArray.length) setTimeout(write, newTextDelay + 250);
});
