// ----------------------------------------------------
// 1. 테마 전환 함수
// ----------------------------------------------------
const toggleTheme = () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");

  if (isLight) {
    themeToggleBtn.innerHTML = "Dark";
    localStorage.setItem("theme", "light");
  } else {
    themeToggleBtn.innerHTML = "Light";
    localStorage.setItem("theme", "dark");
  }
};

const loadTheme = () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggleBtn.innerHTML = "Dark";
  } else {
    document.body.classList.remove("light-mode");
    themeToggleBtn.innerHTML = "Light";
  }
};

// ----------------------------------------------------
// 2. 검색 및 초기화 함수 (DOM 조작 포함)
// ----------------------------------------------------
const clearSearch = () => {
  searchInput.value = "";
  searching = false;
  offset = 0;
  allLoaded = false;
  pokemonList.innerHTML = "";
  loading.textContent = "스크롤해서 포켓몬을 불러오세요... 👇";
  fetchPokemonBatch();
};

// ----------------------------------------------------
// 3. 이벤트 리스너 등록
// ----------------------------------------------------
const setupEventListeners = () => {
  // 무한 스크롤 이벤트
  window.addEventListener("scroll", () => {
    if (
      !loadingData &&
      !allLoaded &&
      !searching &&
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 800
    ) {
      fetchPokemonBatch();
    }
  });

  // 검색/초기화 이벤트
  searchBtn.addEventListener("click", searchPokemon);
  clearBtn.addEventListener("click", clearSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchPokemon();
  });

  // 테마 버튼 클릭 이벤트
  themeToggleBtn.addEventListener("click", toggleTheme);

  // 모달 닫기
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
