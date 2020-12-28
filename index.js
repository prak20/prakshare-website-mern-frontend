const dropFiles=document.querySelector(".dropfiles");
const browseBtn=document.querySelector(".browseBtn");
const browseFile=document.querySelector("#browseFile");
const fileUploader=document.querySelector(".bgProgress");
const percVal=document.querySelector("#percent");
const progressbar=document.querySelector(".progress-bar");
const progressContainer=document.querySelector(".progress-container");
const fileURL=document.querySelector("#fileURL");
const shareContainer=document.querySelector(".share-container");
const copyBtn=document.querySelector("#copyBtn");
const emailForm=document.querySelector("#emailForm");
const toastify=document.querySelector(".toast");
const total_Size = 100 * 1024 * 1024; //100mb
const host="https://prakshare.herokuapp.com/"
const uploadURL=`${host}api/files`  // or const uploadURL=host + "api/files"
const emailURL=`${host}api/files/send` 
dropFiles.addEventListener("dragover",(e)=>{
    e.preventDefault()
    if(!dropFiles.classList.contains("dragged")){
        dropFiles.classList.add("dragged")
    }
})
dropFiles.addEventListener("dragleave",()=>{
    dropFiles.classList.remove("dragged")
})
dropFiles.addEventListener("drop",(e)=>{
    e.preventDefault()
    dropFiles.classList.remove("dragged")
    const files=e.dataTransfer.files
    // console.table(files)
    if(files.length){
        browseFile.files=files
        uploadFile()
    }
});
browseFile.addEventListener("change",()=>{
    uploadFile();
})
browseBtn.addEventListener("click",()=>{
    browseFile.click();
})

copyBtn.addEventListener("click",()=>{
    fileURL.select()
    document.execCommand("copy")
    showMessage("Link Copied")
    toastify.style.display="block";

})

const uploadFile=()=>{
    if(browseFile.files.length>1){
        resetInput();
        showMessage("Only 1 File Allowed While Uploading");
        toastify.style.display="block";
        return;
    }
    const file=browseFile.files[0]
    if (file.size>total_Size){
        showMessage("File Size Should be max 100mb")
        toastify.style.display="block";
        resetInput();
        return;
    }
    progressContainer.style.display='block'
    const formData=new FormData()
    formData.append("myfile",file);
    const xhr = new XMLHttpRequest();
    // JAB EVENT CHANGE HOTA HAI THEN THIS onreadystatechange() WORKS
    xhr.onreadystatechange=()=>{
        if(xhr.readyState===XMLHttpRequest.DONE){
            // console.log(xhr.response)
            onUploadSuccess(JSON.parse(xhr.response))
        }
    }
    xhr.upload.onprogress=updateProgress;
    xhr.upload.onerror=()=>{
        showMessage(`Error in Uploading : ${xhr.statusText}`)
        toastify.style.display="block";
    }
    xhr.open("POST",uploadURL)
    xhr.send(formData)
}
const updateProgress=(e)=>{
    const perc=Math.round((e.loaded/e.total)*100)
    // console.log(perc)
    fileUploader.style.width=`${perc}%`
    percVal.innerText=perc
    progressbar.style.transform=`scaleX(${perc/100})`
}

const onUploadSuccess=({file: url})=>{  // DESTRUCTURING THE FILE
    // console.log(url)
    resetInput()
    emailForm[2].removeAttribute("disabled")
    progressContainer.style.display='none';
    shareContainer.style.display='block';

    fileURL.value=url
};

const resetInput=()=>{
    browseFile.value="";
}
emailForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    // console.log("form submit")
    const url=(fileURL.value);
    const formData={
        uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["toemail"].value,
    emailFrom: emailForm.elements["fromemail"].value,
    };
    emailForm[2].setAttribute("disabled","true")
    // console.table(formData)
    fetch(emailURL,{
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(({success}) =>{
        if(success){
            shareContainer.style.display="none";
            showMessage("Email Sent")
            toastify.style.display="block";

        }
    })
})

let toastTimer;
// the toastify function
const showMessage = (msg) => {
  toastify.innerHTML = msg;
  toastify.style.transform="translate(-50%,0)"
    clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastify.style.transform="translate(-50%,60px)"
  }, 2000);
};