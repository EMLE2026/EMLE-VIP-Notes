'use strict';
// Only the public excerpt, faculty and timestamp are accepted by this renderer.
window.EMLEFeedbackImage = async function({text,sections,faculty,timestamp,isUpdate=false}) {
 if(typeof text!=='string'||!text.trim())throw Error('empty');
 await document.fonts.load('15px "IBM Plex Sans Arabic"');
 await document.fonts.load('600 18px "IBM Plex Sans Arabic"');
 const logo=new Image();logo.src='feedback-logo.png';await logo.decode();
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),font='"IBM Plex Sans Arabic",Tahoma,sans-serif';
 const setFont=(size,weight=400)=>{ctx.font=`${weight} ${size}px ${font}`};
 function wrap(value,width,size){setFont(size);const lines=[];for(const paragraph of value.replace(/\r\n?/g,'\n').split('\n')){let line='';for(const word of paragraph.split(/(\s+)/u)){if(ctx.measureText(line+word).width<=width){line+=word;continue}if(line.trim()){lines.push(line.trimEnd());line=''}if(ctx.measureText(word).width<=width){line=word.trimStart();continue}for(const {segment} of new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(word)){if(ctx.measureText(line+segment).width>width&&line){lines.push(line);line=''}line+=segment}}lines.push(line.trimEnd())}return lines}
 const school=faculty?wrap(faculty,440,14):[],top=Math.max(200,187+school.length*23),bottom=430;
 const buildBody=size=>Array.isArray(sections)?sections.filter(s=>typeof s.text==='string'&&s.text.trim()).flatMap(s=>[{text:s.title,title:true,color:s.kind==='negative'?'#aa8148':'#208568'},...wrap(s.text,488,size).map(text=>({text}))]):wrap(text,488,size).map(text=>({text}));
 let size=24,lineHeight=44,body=buildBody(size);
 while(body.length*lineHeight>bottom-top&&size>18){size--;lineHeight=size+20;body=buildBody(size)}
 const perPage=Math.max(1,Math.floor((bottom-top)/lineHeight)),pages=[];
 for(let i=0;i<body.length;){let end=Math.min(i+perPage,body.length);if(end<body.length&&end-i>1&&body[end-1].title)end--;pages.push(body.slice(i,end));i=end}
 const blobs=[];
 for(let pageIndex=0;pageIndex<pages.length;pageIndex++){
 const lines=pages[pageIndex],bodyY=(top+bottom-lines.length*lineHeight)/2,footerY=455,cardBottom=495,height=600;
 canvas.width=1200;canvas.height=Math.ceil(height*2);ctx.scale(2,2);
 ctx.fillStyle='#f5f7f7';ctx.fillRect(0,0,600,height);
 ctx.drawImage(logo,32,32,65,68);
 function write(value,x,y,size,color,align='right',weight=400,direction='rtl'){setFont(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.direction=direction;ctx.fillText(value,x,y)}
 write('EMLE in a Nutshell',111,62,18,'#162e38','left',600,'ltr');write('Your Feedbacks',111,89,12,'#107e73','left',400,'ltr');
 ctx.beginPath();ctx.roundRect(32,124,536,cardBottom-124,12);ctx.fillStyle='#ffffff';ctx.fill();ctx.strokeStyle='#e3e9e9';ctx.lineWidth=1;ctx.stroke();
 ctx.font='60px Georgia';ctx.textAlign='left';ctx.direction='ltr';ctx.fillStyle='#d9eae4';ctx.fillText('“',54,176);
 school.forEach((line,i)=>write(line,544,164+i*23,14,'#162e38','right',500));
 lines.forEach((line,i)=>write(line.text,544,bodyY+size+4+i*lineHeight,line.title?14:size,line.title?line.color:'#4a6169','right',line.title?500:400));
 const rule=y=>{ctx.beginPath();ctx.moveTo(56,y);ctx.lineTo(544,y);ctx.strokeStyle='#e3e9e9';ctx.stroke()};rule(footerY);
 if(Number.isFinite(timestamp)&&timestamp>0){const options={timeZone:'Africa/Cairo'};write(new Intl.DateTimeFormat('ar-EG',{...options,day:'numeric',month:'short',year:'numeric'}).format(timestamp),544,footerY+27,11,'#95a4aa');write(new Intl.DateTimeFormat('en-US',{...options,hour:'numeric',minute:'2-digit',hour12:true}).format(timestamp)+(isUpdate?' · آخر تعديل':''),56,footerY+27,11,'#95a4aa','left',400,'ltr')}
 else write('توقيت الإرسال غير متاح',544,footerY+27,11,'#95a4aa');
 if(pages.length>1)write(`${pageIndex+1} / ${pages.length}`,300,footerY+27,10,'#95a4aa','center',400,'ltr');
 rule(cardBottom+25);
 write('قناة التليجرام',568,cardBottom+61,10,'#71818b');write('t.me/EMLEinNutshell',32,cardBottom+61,11,'#107e73','left',400,'ltr');
 write('للتواصل وتفعيل المنصة',568,cardBottom+85,10,'#71818b');write('t.me/EMLE_inNutshell_Contact',32,cardBottom+85,11,'#107e73','left',400,'ltr');
 blobs.push(await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('image failed')),'image/png')));
 }
 return blobs.length===1?blobs[0]:blobs;
};
