// ----------------------------------------------------
// 1. 진화 정보 관련 함수
// ----------------------------------------------------

const getEvolutionCondition = (details) => {
  return "→";
};

// 진화 체인을 재귀적으로 파싱하여 HTML 문자열 반환
const buildEvolutionChainHtml = (chain) => {
  if (!chain) return "";

  let html = "";
  const currentStage = chain.species;
  const nextStages = chain.evolves_to;

  // 포켓몬 ID 및 이미지 URL
  const currentId = currentStage.url.match(/\/(\d+)\//)[1];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`;

  // 한국어 이름
  const speciesData = allPokemonSpecies.find((s) => s.id == currentId);
  const koreanName = speciesData?.korean_name || currentStage.name;

  // 현재 단계 렌더링
  html += `
    <div class="evo-stage">
        <img src="${imageUrl}" alt="${koreanName}" loading="lazy">
        <div class="evo-name">${koreanName}</div>
    </div>
  `;

  // 다음 단계가 있다면 (한 경로만 표시하도록 단순화)
  if (nextStages && nextStages.length > 0) {
    const next = nextStages[0];

    // 화살표 렌더링
    html += `
        <div class="evo-arrow">
            →
        </div>
      `;

    // 재귀적으로 다음 단계를 렌더링
    html += buildEvolutionChainHtml(next);
  }

  return html;
};

// fetchEvolutionChain 함수
const fetchEvolutionChain = async (speciesUrl) => {
  try {
    const speciesRes = await fetch(speciesUrl);
    const speciesData = await speciesRes.json();

    const evoChainUrl = speciesData.evolution_chain.url;

    const evoRes = await fetch(evoChainUrl);
    const evoData = await evoRes.json();

    const evoChainHtml = buildEvolutionChainHtml(evoData.chain);

    return `
      <div id="evolutionContainer">
        <div class="evolution-chain">
          ${evoChainHtml}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
    return "";
  }
};

// ----------------------------------------------------
// 2. 데이터 로드 및 렌더링 함수
// ----------------------------------------------------

const fetchAllSpecies = async () => {
  try {
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species?limit=2000`
    );
    const speciesList = await speciesRes.json();
    const promises = speciesList.results.map(async (s) => {
      const res = await fetch(s.url);
      const species = await res.json();
      const koreanNameObj = species.names.find((n) => n.language.name === "ko");
      return {
        name: species.name,
        id: species.id,
        korean_name: koreanNameObj?.name,
        url: s.url,
      };
    });
    allPokemonSpecies = await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching all species:", error);
  }
};

const fetchPokemonBatch = async () => {
  if (loadingData || allLoaded || searching) return;
  loadingData = true;
  loading.textContent = "포켓몬 데이터 불러오는 중... ⏳";

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const data = await response.json();

    if (data.results.length === 0) {
      allLoaded = true;
      loading.textContent = "✅ 모든 포켓몬 로드 완료!";
      loadingData = false;
      return;
    }

    const promises = data.results.map(async (p) => {
      const res = await fetch(p.url);
      const details = await res.json();
      const speciesData = allPokemonSpecies.find((s) => s.id === details.id);

      return {
        id: details.id,
        name: details.name,
        korean_name: speciesData?.korean_name,
        image: details.sprites.front_default,
        detailsUrl: p.url,
      };
    });

    const batchData = await Promise.all(promises);
    batchData.forEach((pokemon) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="pokemon-id">#${pokemon.id.toString().padStart(4, "0")}</div>
        <img src="${pokemon.image}" alt="${
        pokemon.korean_name || pokemon.name
      } 이미지">
        <div class="pokemon-name">${
          pokemon.korean_name || "이름 불러오는 중"
        }<br>(${pokemon.name})</div>
      `;
      li.addEventListener("click", () =>
        showPokemonDetail(pokemon.detailsUrl, pokemon.korean_name)
      );
      pokemonList.appendChild(li);
    });

    offset += limit;
    loadingData = false;
    loading.textContent = "스크롤해서 다음 포켓몬 불러오기... 👇";
  } catch (error) {
    console.error("Error fetching batch:", error);
    loadingData = false;
    loading.textContent = "⚠️ 데이터 로드 중 오류 발생!";
  }
};

// 포켓몬 상세 모달 표시
const showPokemonDetail = async (url, knownKoreanName) => {
  modalBody.innerHTML = "상세 정보 불러오는 중... ✨";
  modal.style.display = "flex";

  try {
    const res = await fetch(url);
    const details = await res.json();

    const speciesRes = await fetch(details.species.url);
    const species = await speciesRes.json();

    const koreanName =
      knownKoreanName ||
      species.names.find((n) => n.language.name === "ko")?.name ||
      details.name;

    const typesHTML = details.types
      .map(
        (t) =>
          `<span class="type ${typeClassMap[t.type.name] || "type-normal"}">${
            typeKoreanMap[t.type.name] || t.type.name
          }</span>`
      )
      .join(" ");

    const flavorTexts = species.flavor_text_entries
      .filter((f) => f.language.name === "ko")
      .map((f) => f.flavor_text.replace(/\n|\f/g, " ").trim());

    const uniqueFlavorTexts = [...new Set(flavorTexts)].filter((t) => t);

    // 진화 체인 정보 로드
    const evolutionChainHtml = await fetchEvolutionChain(details.species.url);

    modalBody.innerHTML = `
      <h2 style="margin-top: 10px;">#${details.id
        .toString()
        .padStart(4, "0")} ${koreanName} (${details.name})</h2>
      
      <div style="font-size: 20px; color: #555; margin-bottom: 20px;">타입: ${typesHTML}</div>
      
      <div style="margin-bottom: 30px;">
        <img src="${details.sprites.front_default}" alt="${koreanName} 앞모습">
        <img src="${details.sprites.back_default}" alt="${koreanName} 뒷모습">
      </div>
      
      ${evolutionChainHtml} 

      <p id="flavorText">${
        uniqueFlavorTexts[0] || "등록된 한국어 설명이 없습니다."
      }</p>
      ${
        uniqueFlavorTexts.length > 1
          ? '<button id="moreBtn">더 많은 도감 설명 보기</button>'
          : ""
      }
    `;

    if (uniqueFlavorTexts.length > 1) {
      const moreBtn = document.getElementById("moreBtn");
      let expanded = false;
      moreBtn.addEventListener("click", () => {
        const flavorTextP = document.getElementById("flavorText");
        if (!expanded) {
          flavorTextP.innerHTML = uniqueFlavorTexts
            .map((text) => `• ${text}`)
            .join("\n\n");
          moreBtn.textContent = "도감 설명 접기";
        } else {
          flavorTextP.innerHTML = uniqueFlavorTexts[0];
          moreBtn.textContent = "더 많은 도감 설명 보기";
        }
        expanded = !expanded;
      });
    }
  } catch (err) {
    console.error("Error showing detail:", err);
    modalBody.innerHTML = "⚠️ 상세 정보를 불러오는 중 오류가 발생했습니다.";
  }
};

// ----------------------------------------------------
// 3. 검색 함수
// ----------------------------------------------------

const searchPokemon = async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  searching = true;
  pokemonList.innerHTML = "<li>🔍 포켓몬 검색 중...</li>";
  loading.textContent = "";

  try {
    let pokemonDetailsUrl = null;
    let foundSpecies = null;

    if (!isNaN(query) && parseInt(query) > 0) {
      pokemonDetailsUrl = `https://pokeapi.co/api/v2/pokemon/${parseInt(
        query
      )}`;
    } else {
      foundSpecies = allPokemonSpecies.find(
        (s) =>
          s.name.toLowerCase() === query ||
          s.korean_name?.toLowerCase() === query
      );

      if (foundSpecies) {
        pokemonDetailsUrl = `https://pokeapi.co/api/v2/pokemon/${foundSpecies.name}`;
      } else {
        try {
          const detailsRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${query}`
          );
          if (detailsRes.ok) {
            const details = await detailsRes.json();
            pokemonDetailsUrl = `https://pokeapi.co/api/v2/pokemon/${details.id}`;
          }
        } catch (e) {
          /* ignore */
        }
      }
    }

    if (!pokemonDetailsUrl) throw new Error("Not Found");

    const detailsRes = await fetch(pokemonDetailsUrl);
    if (!detailsRes.ok) throw new Error("Details Not Found");
    const details = await detailsRes.json();

    const speciesData =
      foundSpecies || allPokemonSpecies.find((s) => s.id === details.id);

    const pokemon = {
      id: details.id,
      name: details.name,
      korean_name: speciesData?.korean_name,
      image: details.sprites.front_default,
      detailsUrl: pokemonDetailsUrl,
    };

    pokemonList.innerHTML = "";
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="pokemon-id">#${pokemon.id.toString().padStart(4, "0")}</div>
      <img src="${pokemon.image}" alt="${
      pokemon.korean_name || pokemon.name
    } 이미지">
      <div class="pokemon-name">${
        pokemon.korean_name || "이름 불러오는 중"
      }<br>(${pokemon.name})</div>
    `;
    li.addEventListener("click", () =>
      showPokemonDetail(pokemon.detailsUrl, pokemon.korean_name)
    );
    pokemonList.appendChild(li);
  } catch (err) {
    pokemonList.innerHTML =
      '<li><div class="pokemon-name" style="color: #ff6b6b; font-size: 20px;">포켓몬을 찾을 수 없습니다. 😥</div></li>';
  } finally {
    searching = false;
  }
};

// ----------------------------------------------------
// 4. 초기화 실행
// ----------------------------------------------------

const init = () => {
  loadTheme();
  setupEventListeners();
  fetchAllSpecies().then(fetchPokemonBatch);
};

init();
