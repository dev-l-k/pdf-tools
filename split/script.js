const {PDFDocument} = PDFLib;
let pdf = null,file=null,mode='each',out = [];
const $ = id=>document.getElementById(id);
const input = $("input");
$("upload").onclick=e=>{
    if(e.target !== input) input.click();
};
input.onchange=()=>load(input.files[0]);
$("upload").ondragover=e=>e.preventDefault();
$("upload").ondrop=e=>{
    e.preventDefault();
    load(e.dataTransfer.files[0]);
};
async function load(f) {
    if(!f||f.type!=="application/pdf") return alert(`Please select a PDF not ${f.type}`);
    try{
        file = f;
        pdf = await PDFDocument.load(await f.arrayBuffer());
        $("fileInfo").innerHTML=`
        <div class="file">
        <div>
        <strong>${esc(f.name)}</strong>
        <br>
        <small>${pdf.getPageCount()} pages</small>
        </div>
        <button onclick="reset()">×</button>
        </div>
        `;
    $("options").style.display="block";
    $("split").disabled=false;
    $('status').textContent="";
    $('results').innerHTML="";
    }catch(e){
        alert(e.message);
    }
}
$("each").onclick =()=>{
    mode="each";
    $("each").classList.add("active");
    $("range").classList.remove("active");
    $('rangeBox').style.display='none';

};
$('range').onclick=()=>{
    mode="range";
    $('range').classList.add('active');
    $('each').classList.remove('active');
    $('rangeBox').style.display='block';

};
$("split").onclick=async()=>{
    $("split").disabled = true;
    out = [];
    try{
        mode === "each"?await splitEach():await splitRanges();
        show();

    }catch(e){
        alert(e.message);
    }
    $("split").disabled=false;
};
async function create(indexes,name){
    const p = await PDFDocument.create();
    const pages = await p.copyPages(pdf,indexes);
    pages.fotEach(x=>p.addPage(x));
    out.push({name,data:await p.save()});
}

async function splitEach() {
    const n = pdf.getPageCount();
    for(let i=0;i<n;i++){
        $("status").textContent = `Creating page ${i+1} of ${n}`;
        await create([i],`${base()}_page_${i+1}.pdf`);


    }
    
}
async function splitRanges() {
    const n= pdf.getPageCount();
    const r = $("ranges").value.split(",").map(x=>x.trim().filter(Boolean));
    if(!r.length) throw Error("Enter page ranges");
    for(let i=0;i<r.length;i++){
    let [a,b]=r[i].split("-").map(Number);
    if(!b)b=a;

    if(!Number.isInteger(a)||!Number.isInteger(b)||
       a<1||b>n||a>b)
      throw Error("Invalid range: "+r[i]);

    $("status").textContent=
      `Creating ${i+1} of ${r.length}...`;

    await create(
      Array.from({length:b-a+1},(_,x)=>a+x-1),
      `${base()}_pages_${a}-${b}.pdf`
    );
  }
    
}
function show(){
    $("status").textContent = `${out.length} PDF created`;
    $("results").innerHTML=out.map((x,i)=>`
    <div class="file">
      <div>
        <strong>📄 ${esc(x.name)}</strong><br>
        <small>${size(x.data.length)}</small>
      </div>
      <button onclick="download(${i})">↓</button>
    </div>
  `).join("")+
  `<button class="btn" onclick="downloadAll()">Download All</button>`;
}
function download(i){
    const x=out[i],a=document.createElement("a");
    a.href= URL.createObjectURL(new Blob([x.data],{type:"application/pdd"}));
    a.download = x.name;
    a.click;
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);

}
async function downloadAll() {
    for(let i= 0; i<out.length;i++){
        download(i);
        await new Promise(r=>setTimeout(r,300));

    }
    

}
function reset(){
    input.value = "";
    $("fileInfo").innerHTML="";
    $("options").style.display="none";
    $("results").innerHTML="";
    $("status").textContent="";
    $("split").disabled=true;
    pdf=null;
    file=null;
    out=[];
}
function base(){
    return file.name.replace(/\.pdf$/i,"");

}
function size(n){
  return n<1048576
    ?(n/1024).toFixed(1)+" KB"
    :(n/1048576).toFixed(2)+" MB";
}

function esc(s){
  return s.replace(/[&<>"']/g,x=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",
    '"':"&quot;","'":"&#39;"
  }[x]));
}

    
