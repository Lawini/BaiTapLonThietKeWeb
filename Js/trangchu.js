const track = document.getElementById("track");
const btnTrai = document.getElementById("sang-trai");
const btnPhai = document.getElementById("sang-phai");

// lay anh
const danhSachAnh = document.querySelectorAll(".anh-qcao img");

let currentIndex = 1;
const tongAnh = danhSachAnh.length;

//di chuyen anh

//Nhay len anh 2 can giua
let buocNhay = danhSachAnh[0].clientWidth + 20;
    track.style.transform = `translateX(-${currentIndex * buocNhay}px)`;


function dichChuyenAnh(){
    track.style.transition =  `transform 0.5s ease-in-out`;
    track.style.transform = `translateX(-${currentIndex * buocNhay}px)`;    

}

btnPhai.addEventListener("click", function(){
    if(currentIndex >= tongAnh - 1){
        return;
    }
    currentIndex++;
    dichChuyenAnh();
});

btnTrai.addEventListener("click", function(){
    if(currentIndex <= 0){
        return;
    }
    currentIndex--;
    dichChuyenAnh();
});

track.addEventListener("transitionend", function(){
    if(danhSachAnh[currentIndex].id === "dau"){
        track.style.transition = "none";
        currentIndex = 1;
        track.style.transform = `translateX(-${currentIndex * buocNhay}px)`;  
    }
    else if(danhSachAnh[currentIndex].id === "cuoi"){
        track.style.transition = "none";
        currentIndex = tongAnh - 2;
        track.style.transform = `translateX(-${currentIndex * buocNhay}px)`;  
    }
});

