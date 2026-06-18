document.addEventListener('DOMContentLoaded', () => {
const likeBtn = document.getElementById('likeBtn');
const likeCount = likeBtn.querySelector('span');

let count = 0;
let hasLiked = false;

likeBtn.addEventListener('click', () => {
if (!hasLiked) {
count++;
hasLiked = true;
likeBtn.classList.add('liked');
} else {
count--;
hasLiked = false;
likeBtn.classList.remove('liked');
}

likeCount.textContent = count;
});
});
