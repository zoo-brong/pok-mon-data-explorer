// 전역 변수 및 DOM 요소
const pokemonList = document.getElementById("pokemonList");
const loading = document.getElementById("loading");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// API 및 상태 변수
let offset = 0;
const limit = 20;
let loadingData = false;
let allLoaded = false;
let searching = false;
let allPokemonSpecies = [];

// 타입 -> CSS 클래스 매핑
const typeClassMap = {
  grass: "type-grass",
  fire: "type-fire",
  water: "type-water",
  bug: "type-bug",
  normal: "type-normal",
  electric: "type-electric",
  poison: "type-poison",
  ground: "type-ground",
  fairy: "type-fairy",
  fighting: "type-fighting",
  psychic: "type-psychic",
  rock: "type-rock",
  ghost: "type-ghost",
  ice: "type-ice",
  dragon: "type-dragon",
  dark: "type-dark",
  steel: "type-steel",
  flying: "type-flying",
};

// 타입 -> 한국어 이름 매핑
const typeKoreanMap = {
  grass: "풀",
  fire: "불꽃",
  water: "물",
  bug: "벌레",
  normal: "노말",
  electric: "전기",
  poison: "독",
  ground: "땅",
  fairy: "페어리",
  fighting: "격투",
  psychic: "에스퍼",
  rock: "바위",
  ghost: "고스트",
  ice: "얼음",
  dragon: "드래곤",
  dark: "악",
  steel: "강철",
  flying: "비행",
};
