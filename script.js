const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
const starCount = 150; // 입자 개수 (원하는 만큼 조절하세요)

// 캔버스 크기 설정
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

// 별 객체 생성
class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2; // 입자 크기
    this.speedX = (Math.random() - 0.5) * 0.5; // X축 이동 속도 (무작위)
    this.speedY = (Math.random() - 0.5) * 0.5; // Y축 이동 속도 (무작위)
    this.opacity = Math.random();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // 화면 밖으로 나가면 반대편에서 등장 (무한 루프)
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; // 흰색 별
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 별 초기화
function init() {
  stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
}

// 애니메이션 실행
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 잔상 제거
  stars.forEach((star) => {
    star.update();
    star.draw();
  });
  requestAnimationFrame(animate);
}

init();
animate();

const container = document.querySelector(".main-container");
const video = document.getElementById("bg-video");
const svg = document.querySelector(".overlay-svg");

let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX, startY;

// 1. 마우스 휠로 확대/축소 (Zoom)
// 확대/축소 설정값
const MIN_SCALE = 1; // 최소 1배 (원래 크기보다 작아지지 않음)
const MAX_SCALE = 3; // 최대 5배 (원하는 만큼 숫자를 키우세요)
const ZOOM_SPEED = 0.1; // 한 번 휠 돌릴 때 커지는 정도

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault(); // 스크롤 방지

    // 휠 방향에 따라 확대(+) 또는 축소(-) 결정
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;

    // 현재 배율에서 delta를 더하되, 최소값과 최대값 사이로 고정(Clamp)
    let newScale = scale + delta;
    newScale = Math.min(Math.max(MIN_SCALE, newScale), MAX_SCALE);

    if (newScale !== scale) {
      scale = newScale;
      applyTransform();
    }
  },
  { passive: false },
);

// 2. 마우스 클릭 후 드래그로 이동 (Pan)
window.addEventListener("mousedown", (e) => {
  if (scale > 1) {
    // 확대된 상태에서만 이동 가능
    isPanning = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    container.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  originX = e.clientX - startX;
  originY = e.clientY - startY;
  applyTransform();
});

window.addEventListener("mouseup", () => {
  isPanning = false;
  container.style.cursor = "default";
});

// 3. 실제로 화면을 변형시키는 함수
function applyTransform() {
  // 영상과 SVG를 동시에 똑같이 움직여야 좌표가 안 틀어짐
  const transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  video.style.transform = transform;
  svg.style.transform = transform;
}
document.addEventListener("DOMContentLoaded", () => {
  const roomPaths = document.querySelectorAll(".room-path");
  const infoDesc = document.getElementById("info-box-desc");

  roomPaths.forEach((path) => {
    path.addEventListener("mouseenter", () => {
      const infoText = path.getAttribute("data-info");
      if (infoText && infoDesc) {
        infoDesc.textContent = infoText;
      }
    });

    path.addEventListener("mouseleave", () => {
      if (infoDesc) {
        infoDesc.textContent = defaultDesc;
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const roomPaths = document.querySelectorAll(".room-path");
  const infoTitle = document.getElementById("info-box-title");
  const infoDesc = document.getElementById("info-box-desc");

  roomPaths.forEach((path) => {
    // 1. 방에 마우스를 올렸을 때
    path.addEventListener("mouseenter", function () {
      // 페이드 인 효과를 위해 body에 클래스 추가
      document.body.classList.add("is-hovered");

      // HTML에 작성된 각 방의 고유 타이틀과 설명 가져오기
      const titleText = this.getAttribute("data-title");
      const descText = this.getAttribute("data-desc");

      // 패널에 텍스트 반영 (여기를 수정해 각 방의 더미글을 다르게 제어할 수 있습니다)
      if (infoTitle && titleText) infoTitle.textContent = titleText;
      if (infoDesc && descText) infoDesc.textContent = descText;
    });

    // 2. 방에서 마우스가 벗어났을 때
    path.addEventListener("mouseleave", function () {
      // 페이드 아웃 효과를 위해 body에서 클래스 제거
      document.body.classList.remove("is-hovered");
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("intro-loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

  let progress = 0;

  // 로딩 속도 조절 (숫자가 작을수록 빨리 차오름)
  const loadingInterval = setInterval(() => {
    // 랜덤한 증가 폭을 주어 진짜 시스템이 로딩되는 듯한 느낌 연출
    progress += Math.floor(Math.random() * 15) + 5;

    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);

      // 로딩 완료 후 0.3초 대기했다가 페이드아웃 클래스 부착
      setTimeout(() => {
        loader.classList.add("fade-out");
      }, 300);
    }

    loaderBar.style.width = progress + "%";
    loaderPercent.textContent = progress + "%";
  }, 80);
});

document.addEventListener("DOMContentLoaded", () => {
  // 1. 인트로 로딩 시뮬레이션
  const loader = document.getElementById("intro-loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      setTimeout(() => {
        loader.classList.add("fade-out");
      }, 300);
    }
    loaderBar.style.width = progress + "%";
    loaderPercent.textContent = progress + "%";
  }, 50);

  // 2. 방 호버 시 우측 하단 패널 데이터 및 오토 센터링 미니맵 연동
  const roomPaths = document.querySelectorAll(".room-path");
  const body = document.body;

  const infoNo = document.getElementById("info-box-no");
  const infoTitle = document.getElementById("info-box-title");
  const infoDesc = document.getElementById("info-box-desc");
  const infoItems = document.getElementById("info-box-items");
  const panelMiniPath = document.getElementById("panel-mini-path");
  const panelMiniSvg = document.getElementById("panel-mini-svg");

  let hideTimeout = null;

  // SVG path 문자열에서 Bounding Box를 파싱하는 함수
  function getPathBBox(dStr) {
    const matches = dStr.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!matches || matches.length < 4) return { x: 0, y: 0, w: 100, h: 100 };

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (let i = 0; i < matches.length; i += 2) {
      const x = parseFloat(matches[i]);
      const y = parseFloat(matches[i + 1]);
      if (!isNaN(x) && !isNaN(y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    return {
      x: minX,
      y: minY,
      w: maxX - minX || 100,
      h: maxY - minY || 100,
    };
  }

  roomPaths.forEach((path) => {
    path.addEventListener("mouseenter", () => {
      // 마우스를 다시 올리면 사라지는 타이머를 취소하여 글자가 계속 유지되게 함
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      body.classList.add("is-hovered");

      // 데이터 속성 가져오기
      const no = path.getAttribute("data-no");
      const title = path.getAttribute("data-title");
      const desc = path.getAttribute("data-desc");
      const dValue = path.getAttribute("data-d");
      const itemsJson = path.getAttribute("data-items");

      // 패널 텍스트 채우기 (안내 문구 영역은 절대 건드리거나 채우지 않음)
      infoNo.textContent = no;
      infoTitle.textContent = title;
      infoDesc.textContent = desc;

      // 미니맵 도형 패스 적용 및 오토 센터링
      if (panelMiniPath && panelMiniSvg && dValue) {
        panelMiniPath.setAttribute("d", dValue);

        const bbox = getPathBBox(dValue);
        const padding = Math.max(bbox.w, bbox.h) * 0.1;
        const vbX = bbox.x - padding;
        const vbY = bbox.y - padding;
        const vbW = bbox.w + padding * 2;
        const vbH = bbox.h + padding * 2;

        let finalX = vbX;
        let finalY = vbY;
        let finalSize = Math.max(vbW, vbH);

        if (vbW > vbH) {
          finalY -= (vbW - vbH) / 2;
        } else {
          finalX -= (vbH - vbW) / 2;
        }

        panelMiniSvg.setAttribute(
          "viewBox",
          `${finalX} ${finalY} ${finalSize} ${finalSize}`,
        );
      }

      // 우측 리스트 목록 채우기
      if (infoItems && itemsJson) {
        try {
          const itemsArray = JSON.parse(itemsJson);
          infoItems.innerHTML = "";
          itemsArray.forEach((itemText) => {
            const div = document.createElement("div");
            div.className = "panel-item-text";
            div.textContent = itemText;
            infoItems.appendChild(div);
          });
        } catch (e) {
          infoItems.innerHTML = "";
        }
      }
    });
  });

  // 마우스가 방을 벗어났을 때 5초 동안 정보와 프레임을 유지 후 숨기기
  const svgOverlay = document.querySelector(".overlay-svg");
  if (svgOverlay) {
    svgOverlay.addEventListener("mouseleave", () => {
      if (hideTimeout) clearTimeout(hideTimeout);

      // 5초(5000밀리초) 후에 패널을 숨김 처리
      hideTimeout = setTimeout(() => {
        body.classList.remove("is-hovered");
      }, 3000);
    });
  }
});
window.onwheel = (e) => {
  target += e.deltaY > 0 ? 1 : -1;
};
render();

// 유휴 상태 안내 오버레이
(function () {
  const idleOverlay = document.getElementById("idle-overlay");
  const IDLE_DELAY = 5000; // 5초
  let idleTimer = null;

  function showIdle() {
    idleOverlay.classList.add("active");
  }
  function hideIdle() {
    idleOverlay.classList.remove("active");
  }
  function resetIdleTimer() {
    hideIdle();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showIdle, IDLE_DELAY);
  }

  window.addEventListener("mousemove", resetIdleTimer);
  window.addEventListener("mousedown", resetIdleTimer);
  window.addEventListener("keydown", resetIdleTimer);

  resetIdleTimer();
})();
