let cards=document.getElementsByClassName('card');//取得所有的卡牌元素
let fronts=document.getElementsByClassName('front');//取得所有的卡面元素
let backs=document.getElementsByClassName('back');//取得所有背面元素
let gains=document.getElementsByClassName('gain');//取得所有分數顯示元素(同時作為card_mask)

let gap=[1];//用來計算卡牌翻面時間的基準值，最多同時兩張牌，所以以陣列方式存放兩個值
let frames=[0];//用來計算翻牌期間的幀數，作為條件判斷的值，最多同時兩張牌，所以以陣列方式存放兩個值
let ani=new Array();//存放動畫執行時的計時物件
let shows=new Array();//存放被翻牌的元素物件

let itemData = [];//儲存google sheet中的item
let feedBack='';//存取設定項目表中的tbody元素
let getCard='';//存取卡片元素

$(function(){
	getData({'evt': 'read'});
	keyDetection();

	$('.start').click(function(){
		document.getElementsByClassName('mask')[0].style.display="none";

		initial();//初始化全域變數及資料
	
		shuffle(itemData);

		tempHideAll();

		for(i = 0; i < backs.length; i++){//設定卡牌背面圖片
			backs[i].innerHTML = i + 1;
		}

		//設定卡牌的資料內容及顯示圖片
		for(i = 0; i < fronts.length; i++){
			fronts[i].setAttribute("data-type", itemData[i]);//設定資料內容
			fronts[i].innerHTML = itemData[i];
		}

		//設定卡牌的點擊偵測事件
		for(i = 0; i < cards.length; i++){

			//卡牌點擊事件綁定函式，發生onclick時才會去執行
			cards[i].onclick=function cardClick(){
				gap[0]=1;
				document.getElementById("wall").style.display="block";//把透明牆打開，以防誤點

				//判斷陣列中是否有重覆的元素以及元素是否是己經完成的牌卡
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
			document.querySelector('.settingForm').style.bottom = '10%';
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
			document.querySelector('tbody').innerHTML=feedBack;//還原表格內容
			return;
		}

		let data = {
			'evt': 'write',
			'items': JSON.stringify(itemArr)
		}
		saveData(data);
	});

	$('.close').click(function(){
		document.querySelector('.settingForm').style.bottom = '20%';
		// $('.mask').removeClass('show');
		setTimeout(function(){
			$('.mask').removeClass('show');
		}, 100);
		setTimeout(function(){
			document.querySelector('.mask').style.display='none';
			document.querySelector('tbody').innerHTML=feedBack;//還原表格內容
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
		for(i=0; i<inputEle.length; i++){
			if(i+1 == inputEle.length){
				inputEle[i].focus();
			}
		}
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
			for(i = 0; i < response.data.items.length; i++){//取資料並產生卡片張數
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






//初始化相關資料函式
function initial(){
	gap=[1];
	frames=[0];
	ani.length=0;
	shows.length=0;

	//將卡牌元素中的style屬性都先移除
	for(i=0;i<cards.length;i++){
		cards[i].removeAttribute('style');
		cards[i].childNodes[0].removeAttribute('style');
		cards[i].childNodes[1].removeAttribute('style');
		cards[i].nextSibling.classList.remove("card_mask");
	}
}



function continueTime() {
	if(shows.length>0){
		//有翻牌時，執行移除卡片遮罩(card_mask)、關閉訊息
		shows[0].nextSibling.classList.remove("card_mask");
		shows[1].nextSibling.classList.remove("card_mask");

		document.getElementsByClassName('mask')[0].style.display="none";
		// counterHandle=setInterval(timeCounter,1000)

		shows[0].removeAttribute('style')
		shows[1].removeAttribute('style')
		document.getElementById("wall").style.display="block";
		ani[0]=setInterval(fade,10,shows[0],0)
		ani[1]=setInterval(fade,10,shows[1],1)

		shows.length=0;
	} else {
		//未翻牌時，執行關閉訊息
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










/* 沒問題的函式 */
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

//翻牌效果函式
function fade(obj, d){
	//判定翻轉到一半時，交換要顯示的牌面內容
	if(frames[d]==10){
		if(obj.childNodes[0].style.display=="none" || obj.childNodes[0].style.display==""){
			obj.childNodes[1].style.display="none";
			obj.childNodes[0].style.display="flex";
		} else {
			obj.childNodes[1].style.display="flex";
			obj.childNodes[0].style.display="none";
		}
	}

	//根據不同的幀數來決定要進行的動作  
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
/* 沒問題的函式 */










/* typewriter effect es6 */
const typedTextSpan = document.querySelector(".keyText");
const cursorSpan = document.querySelector(".cursor");

const textArray = ["今天做什麼", "下班新鮮試"];
const typingDelay = 200;
const erasingDelay = 100;
const newTextDelay = 2000; // Delay between current and next text
let textArrayIndex = 0;
let charIndex = 0;

function type() {
	if (charIndex < textArray[textArrayIndex].length) {
		if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
		typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
		charIndex++;
		setTimeout(type, typingDelay);
	}
	else {
		cursorSpan.classList.remove("typing");
		setTimeout(erase, newTextDelay);
	}
}

function erase() {
	if (charIndex > 0) {
		if (!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
		typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
		charIndex--;
		setTimeout(erase, erasingDelay);
	}
	else {
		cursorSpan.classList.remove("typing");
		textArrayIndex++;
		if (textArrayIndex >= textArray.length) textArrayIndex = 0;
		setTimeout(type, typingDelay + 1100);
	}
}

document.addEventListener("DOMContentLoaded", function () { // On DOM Load initiate the effect
	if (textArray.length) setTimeout(type, newTextDelay + 250);
});