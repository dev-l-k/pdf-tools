let images = [];
function addImages(){
    let input = document.getElementById('images');
    for (let file of input.files){
         if (file.type.startsWith("image/")) images.push(file);
    }
    input.value="";
    showImages();

}
function showImages(){
    let list = document.getElementById("imageList");
    list.innerHTML = images.map((file,i) => `
    <div class="file">
    <span>${i + 1}. ${file.name}</span>
    <button onclick="removeImage(${i})">×</button>
    </div>
    `).join("");
    document.getElementById('makeBtn').disabled = !images.length;
}
function removeImage(i){
    images.splice(i,1);
    showImages();
}
async function makePDF() {
    let button = document.getElementById("makeBtn");
    let status = document.getElementById("status");
    button.disabled = true;
    status.textContent="Creating PDF...";
    try{
        let pdf = null;
        for (let i=0; i<images.length;i++){
            status.textContent = `Adding image ${i+1} of ${images.length}...`;
            let image = await loadImage(images[i]);
            let width = image.width;
            let height = image.height;
            if(!pdf){
                pdf = new window.jspdf.jsPDF({
                    unit: "px",
                    format: [width,height]
                });
            }else{
                pdf.addPage([width,height]);
            }
            const format = fileType = images[i].type.includes("png") ? "PNG" : "JPEG";
            pdf.addImage(image, format, 0, 0, width, height);


        }
        pdf.save("images.pdf");
        status.textContent="PDF Created..";
    }catch(error){
        console.log(error);
        status.textContent="Could not Generate Pdf";

    }
    button.disabled=false;
    
}
function loadImage(file){
    return new Promise((resolve,reject) => {
        let image = new Image();
        let url = URL.createObjectURL(file);
        image.onload = () => {
            
            resolve(image);
        };
        image.onerror = reject;
        image.src = url;
    });
}
function updateTime(){
    const clock = document.getElementById('time');
    const time = new Date().toLocaleTimeString();
    clock.textContent = time;
}
updateTime();
setInterval(updateTime,1000);