function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const icon = document.querySelector('#audioControl i');
    
    if (audio.paused) {
        audio.play();
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    } else {
        audio.pause();
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    }
}