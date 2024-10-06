const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat');//기존 틀 제거함으로써 변경
const count = document.querySelector('#count');
const total = document.querySelector('#total');

const movieSelect = document.querySelector('#movie');

const clearBtn = document.querySelector('#clearBtn');
const loginBtn = document.querySelector('#loginBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const resetBtn = document.querySelector('#resetBtn');
const screen = document.querySelector('.screen');

let ticketPrice = +movieSelect.value;

// UI 초기화 및 로드
const populateUI = () => {
    const username = localStorage.getItem('username');
    if (username) {
        loadUserSeats(); // 로그인된 경우 사용자 좌석 상태 로드//selected상태로변경
    } else {
        clearSeats(); // 로그인되지 않은 경우 좌석 초기화
    }
    loadOccupiedSeats(); // 차지된 좌석 로드

    const selectedMovieIdx = localStorage.getItem('selectedMovieIdx');
    if (selectedMovieIdx != null) {
        loadPicture();
        movieSelect.selectedIndex = selectedMovieIdx;
    }
};
const setMovieData = (movieIdx, moviePrice) => {
    localStorage.setItem('selectedMovieIndex', movieIdx);
    localStorage.setItem('selectedMoviePrice', moviePrice);
}

// 좌석 선택 후 로그인한 사용자 정보 저장
const updateSelectedCount = () => {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));
    const username = localStorage.getItem('username');

    if (username) {
        localStorage.setItem(`${username}_seats`, JSON.stringify(seatsIndex));
    }

    const selectedSeatsCnt = selectedSeats.length;
    count.innerText = selectedSeatsCnt;
    total.innerText = selectedSeatsCnt * ticketPrice;
};

//영화 선택 드롭다운에서 영화가 변경되면 발생하는 이벤트 리스너
movieSelect.addEventListener('change', e => {
    ticketPrice = +e.target.value;
    setMovieData(e.target.selectedIndex, e.target.value);
    updateSelectedCount()
    loadPicture()
})



// 좌석 선택 시

container.addEventListener('click', e => {
    const username = localStorage.getItem('username'); // 로그인 상태 확인

    if (!username) {
        alert('로그인 후 좌석을 선택할 수 있습니다.'); // 로그인하지 않은 경우 경고 메시지
        return; // 클릭 이벤트 중단
    }

    // 선택된 좌석 해제할 때 로컬 저장소에서 occupied_seats에서 삭제
    const seatIndex = [...seats].indexOf(e.target);
    const occupiedSeats = JSON.parse(localStorage.getItem('occupied_seats')) || [];

    if (e.target.classList.contains('selected')) {
        e.target.classList.remove('selected'); // 선택 해제

        // 선택 해제된 좌석을 occupiedSeats에서 삭제
        const updatedOccupiedSeats = occupiedSeats.filter(idx => idx !== seatIndex);
        localStorage.setItem('occupied_seats', JSON.stringify(updatedOccupiedSeats));
    } else {
        e.target.classList.add('selected'); // 선택
    }

        
        updateSelectedCount(); // 선택된 좌석 수 업데이트
    }
);


//클래스 screen에 영화가 달라지면 영화값에 따라 사진이 달라짐
function loadPicture() 
{
    const movieValue = movieSelect.value; // movieSelect의 값을 가져옴

    //클래스 다 제거해서 초기화
    screen.classList.remove('joker');
    screen.classList.remove('avengers');
    screen.classList.remove('avatar');
    
    if (movieValue === '8') {
        screen.classList.add('joker');
    }
    if (movieValue === '10') {
        screen.classList.add('avengers');
    }
    if (movieValue === '12'){
        screen.classList.add('avatar');
    }
}




// occupied 상태 업데이트하는 함수!
// 로컬스토리지에서 키가 occupied_seats인 값들을 문자열로 읽어 occupiedSeats에 자리(인덱스) 배열로 저장
// 모든좌석들을 하나하나 넣어서 occupiedSeats에 있는 자리(인덱스) occupied 클래스 추가/없는 자리는 클래스 제거
function loadOccupiedSeats() {
    const occupiedSeats = JSON.parse(localStorage.getItem('occupied_seats')) || [];
    seats.forEach((seat, idx) => {
        if (occupiedSeats.includes(idx)) {
            seat.classList.add('occupied'); // 차지된 좌석 표시
        } else {
            seat.classList.remove('occupied'); // 차지되지 않은 좌석은 occupied 상태 해제
        }
    });
}

// 사용자 좌석 상태 로드 함수
// 사용자_seats에서 배열을 가져와 selected 클래스 적용
function loadUserSeats() {
    const savedUsername = localStorage.getItem('username');
    const userSeats = JSON.parse(localStorage.getItem(`${savedUsername}_seats`)) || [];
   
    seats.forEach((seat, idx) => {
       
        seat.classList.remove('selected'); // 모든 선택 상태 초기화
        if (userSeats.includes(idx)) {
            seat.classList.add('selected'); // 사용자 좌석 표시
        }
        
        
    });
}

// 좌석 초기화 함수(사용자 화면만 가능)
// 모든 자리 selected클래스 제거
function clearSeats() {
    seats.forEach(seat => {
        seat.classList.remove('selected'); // 모든 선택 상태 제거
    });
}


// 사용자 로그인 처리
loginBtn.addEventListener('click', () => {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    // 기존 사용자와 비밀번호 확인
    if (savedUsername && savedPassword) {
        if (savedUsername === username && savedPassword === password) {
            // 기존 사용자: 좌석 상태를 로드하고, 선택 가능하도록 업데이트
            const occupiedSeats = JSON.parse(localStorage.getItem(`${savedUsername}_seats`)) || [];
            occupiedSeats.forEach(idx => {
                if (seats[idx]) {
                    seats[idx].classList.remove('occupied'); // occupied 상태 해제
                    seats[idx].classList.add('selected'); // 선택된 상태로 변경
                }
            });

            loadUserSeats(); // 사용자 좌석 상태 로드
            updateSelectedCount(); // 선택된 좌석 수 업데이트
        } else {
            alert('아이디와 비밀번호가 일치하지 않습니다.'); // 사용자 정보가 다를 경우 경고
        }
    } 
    else {
        // 새로운 사용자: 아이디와 비밀번호 저장
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        clearSeats(); // 새 사용자일 경우 좌석 초기화
    }
});

// 로그아웃 버튼 클릭 시
logoutBtn.addEventListener('click', () => {
    const username = localStorage.getItem('username');
    if (username) {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));

        const occupiedSeats = JSON.parse(localStorage.getItem('occupied_seats')) || [];
        const newOccupiedSeats = [...new Set([...occupiedSeats, ...seatsIndex])]; // 중복 방지
        localStorage.setItem('occupied_seats', JSON.stringify(newOccupiedSeats));

        // 선택된 좌석을 비우고, 선택된 좌석은 occupied 상태로 변경하지 않음
        seats.forEach((seat, idx) => {
            if (seatsIndex.includes(idx)) {
                seat.classList.remove('selected'); // 선택 해제
                // 여기서 occupied 상태로 변경하지 않음
            }
        });

        localStorage.removeItem('username');
        localStorage.removeItem('password');

        document.querySelector('#username').value = '';
        document.querySelector('#password').value = '';
    }

    populateUI(); // UI 업데이트
    updateSelectedCount();
});


// 좌석 초기화 버튼 클릭 시
//occupiedSeats배열에서 userSeats에 없는 좌석들의 인덱스를 updatedOccupiedSeats에 배열로 저장
//updatedOccupiedSeats을 다시 occupiedSeats에 덮어씌우기
//키가 사용자_seats인 값들도 초기화
clearBtn.addEventListener('click', () => {
    const username = localStorage.getItem('username');
    if (username) {
        const userSeats = JSON.parse(localStorage.getItem(`${username}_seats`)) || [];
        const occupiedSeats = JSON.parse(localStorage.getItem('occupied_seats')) || [];

        // 로그인된 사용자의 좌석을 occupiedSeats에서 삭제
        const updatedOccupiedSeats = occupiedSeats.filter(idx => !userSeats.includes(idx));
        localStorage.setItem('occupied_seats', JSON.stringify(updatedOccupiedSeats));

        localStorage.removeItem(`${username}_seats`); // 로그인된 사용자 좌석 정보 삭제
    }

    clearSeats(); // 좌석초기화함수
    updateSelectedCount(); // 좌석 카운트 업데이트
});


//리셋하기
//로컬스토리지 다 비우기!
resetBtn.addEventListener('click', () => {
    localStorage.clear();
    clearSeats(); // UI 업데이트
    populateUI();
    updateSelectedCount(); // 좌석 카운트 업데이트
});


// 페이지 로드 시 초기화
populateUI();
updateSelectedCount();

