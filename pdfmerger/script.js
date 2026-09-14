const input = document.getElementById("pdfFiles");
const list = document.getElementById("fileList");
const button = document.getElementById("mergeBtn");
const status = document.getElementById("status");
let files = [];
function addFiles(){
    for(let file of input.files){
        if(file.type == "application/pdf"){
            files.push(file);
        }
    }
    input.value = "";
    showFiles();
}
function showFiles(){
    list.innerHTML="";
    files.forEach((file,i)=>{
        list.innerHTML += `
        <div class="file">
        <span>${i+1}.${file.name}</span>
        <button onclick="removeFile(${i})" class="file">×</button>
        </div>

        `;
    });
    button.disabled=files.length<2;
}
function removeFile(index){
    files.splice(index,1);
    showFiles();
}
async function mergePDFs() {
    button.disabled=true;
    status.textContent = "Merging PDFs..";
    try{
        const merged = await PDFLib.PDFDocument.create();
        for(let file of files){
            const data = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(data);
            const pages = await merged.copyPages(pdf,pdf.getPageIndices());
            for(let page of pages){
                merged.addPage(page);

            }
        }

        const data = await merged.save();
        const blob = new Blob([data],{type:"application/pdf"});
        const link =document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "merged.pdf";
        link.click();
        status.textContent='PDFs merged successfully'
    }catch(error){
        console.log(error);
        status.textContent="Could not merge pdfs";
    }
    button.disabled=false;


}
function updateTime(){
    const clock = document.getElementById('time');
    const time = new Date().toLocaleTimeString();
    clock.textContent = time;
}
updateTime();
setInterval(updateTime,1000);