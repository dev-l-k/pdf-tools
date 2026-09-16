let file = null;
let level = "medium";
setLevel("medium");
const settings = {
    low: [1.5,0.8],
    medium: [1.2,0.65],
    high: [0.9,0.45]
};
function selectPDF(){
    file = document.getElementById('pdfFile').files[0];
    if (!file) return;
    document.getElementById('fileInfo').innerHTML = `
    <div class='file'>
    <span>${file.name}</span>
    <small>${size(file.size)}</small>
    </div>
    `;
    document.getElementById('oldSize').textContent = size(file.size);
    document.getElementById('newSize').textContent = "-";
    document.getElementById("sizeBox").style.display = 'grid';
    document.getElementById("compressBtn").disabled = false;

}
function setLevel(name){
    level = name;
    document.querySelectorAll(".level").forEach(btn => {
        btn.classList.remove('active');

    });
    document.getElementById(name).classList.add("active");
    document.getElementById('savedSize').textContent="-";

}
async function compressPDF() {
    const button = document.getElementById('compressBtn');
    const status = document.getElementById("status");
    button.disabled = true;
    status.textContent = "Compressing.....";
    try{
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data}).promise;
        const [scale,quality] = settings[level];

        let output;
        

        for (let i = 1;i<=pdf.numPages;i++){
            status.textContent=`Compressing page ${i} of ${pdf.numPages}...`;
            const page = await pdf.getPage(i);
            const view = page.getViewport({scale});
            const canvas = document.createElement("canvas");
            canvas.width = 0;
            canvas.height = 0;

            canvas.width = view.width;
            canvas.height = view.height;
            await page.render({
                canvasContext:canvas.getContext("2d"),
                viewport: view
            }).promise;
            const image = canvas.toDataURL("image/jpeg",quality);
            const width = view.width;
            const height = view.height;
            const orientation = width > height ? "landscape" : "portrait";
            if (!output) {
                output = new jspdf.jsPDF({
                    orientation:orientation,unit: "pt",format: [width, height]
                    
                });
                
            } else {
                output.addPage([width,height], orientation);
                
            }
            output.addImage(
                image,"JPEG",0,0,width,height
            );
        }
        const result = output.output("arraybuffer");
        document.getElementById('newSize').textContent = size(result.byteLength);
        const saved = ((file.size - result.byteLength)/file.size)*100;
        document.getElementById("savedSize").textContent=saved>0? saved.toFixed(1) + "%": "Larger";
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
            new Blob([result],{type:"application/pdf"})
        );
        link.download = "compressed.pdf";
        link.click();
        status.textContent = "Done";


    }catch(error){
        console.log(error);
        status.textContent="Could not compress the PDF";

    }
    button.disabled = false;
}
function size(bytes){
    if (bytes<1048576){
        return(bytes/1024).toFixed(1)+" KB";
    }
    return (bytes/1048576).toFixed(2)+" MB";
}
function updateTime(){
    const clock = document.getElementById('time');
    const time = new Date().toLocaleTimeString();
    clock.textContent = time;
}
updateTime();
setInterval(updateTime,1000);