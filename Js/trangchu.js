const track = document.getElementById("track");
const btnTrai = document.getElementById("sang-trai");
const btnPhai = document.getElementById("sang-phai");

// lay anh
const danhSachAnh = document.querySelectorAll(".anh-qcao img");

let currentIndex = 1;
const tongAnh = danhSachAnh.length;

function buocNhay() {
    const khoangCach = parseFloat(getComputedStyle(track).columnGap) || 0;
    return track.children[0].getBoundingClientRect().width + khoangCach;
}

function capNhatViTri() {
    track.style.transform = `translateX(-${currentIndex * buocNhay()}px)`;
}

capNhatViTri();

function dichChuyenAnh() {
    track.style.transition = "transform 0.5s ease-in-out";
    capNhatViTri();
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

window.addEventListener("resize", function() {
    track.style.transition = "none";
    capNhatViTri();
    void track.offsetHeight;
    track.style.transition = "";
});

setInterval(function() {
    if (currentIndex < tongAnh - 1) {
        currentIndex++;
        dichChuyenAnh();
    }
}, 3000);

track.addEventListener("transitionend", function(){
    if(danhSachAnh[currentIndex].id === "dau"){
        track.style.transition = "none";
        currentIndex = 1;
        capNhatViTri();
    }
    else if(danhSachAnh[currentIndex].id === "cuoi"){
        track.style.transition = "none";
        currentIndex = tongAnh - 2;
        capNhatViTri();
    }
});
