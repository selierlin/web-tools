const GEOJSON_URLS = [
  "./data/countries.geo.json",
  "https://fastly.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json",
  "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json",
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
];

const mapContainer = document.getElementById("map");
const tooltipCountry = document.querySelector(".tooltip-country");
const tooltipTime = document.querySelector(".tooltip-time");
const tooltipZone = document.querySelector(".tooltip-zone");
const searchInput = document.getElementById("country-search");
const searchResults = document.getElementById("search-results");
const srAnnouncer = document.getElementById("sr-announcer");
const compareInputA = document.getElementById("compare-a");
const compareInputB = document.getElementById("compare-b");
const compareOutput = document.getElementById("compare-output");
const compareResultsA = document.getElementById("compare-results-a");
const compareResultsB = document.getElementById("compare-results-b");

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const utcFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "UTC",
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const browserFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: browserTimeZone,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

let currentHover = null;
let clockTimerId = null;
let autoRotateTimerId = null;
let cachedGeojson = null;
let selectedCountryId = null;
let searchIndex = [];
let searchActiveIndex = -1;
let searchCurrentItems = [];
let globeState = null;
const formatterByTimeZone = new Map();
let resizeTimerId = null;
let hoverFreezeUntil = 0;
const HOVER_FREEZE_MS = 5000;
let compareSuggestA = null;
let compareSuggestB = null;

const COUNTRY_NAME_ZH = {
  CHN: "中国",
  USA: "美国",
  CAN: "加拿大",
  MEX: "墨西哥",
  BRA: "巴西",
  ARG: "阿根廷",
  CHL: "智利",
  COL: "哥伦比亚",
  PER: "秘鲁",
  VEN: "委内瑞拉",
  BOL: "玻利维亚",
  ECU: "厄瓜多尔",
  URY: "乌拉圭",
  PRY: "巴拉圭",
  GUY: "圭亚那",
  SUR: "苏里南",
  GBR: "英国",
  IRL: "爱尔兰",
  FRA: "法国",
  DEU: "德国",
  ESP: "西班牙",
  PRT: "葡萄牙",
  ITA: "意大利",
  NLD: "荷兰",
  BEL: "比利时",
  CHE: "瑞士",
  AUT: "奥地利",
  POL: "波兰",
  CZE: "捷克",
  SVK: "斯洛伐克",
  HUN: "匈牙利",
  ROU: "罗马尼亚",
  BGR: "保加利亚",
  GRC: "希腊",
  NOR: "挪威",
  SWE: "瑞典",
  FIN: "芬兰",
  DNK: "丹麦",
  ISL: "冰岛",
  RUS: "俄罗斯",
  UKR: "乌克兰",
  BLR: "白俄罗斯",
  EST: "爱沙尼亚",
  LVA: "拉脱维亚",
  LTU: "立陶宛",
  TUR: "土耳其",
  GEO: "格鲁吉亚",
  ARM: "亚美尼亚",
  AZE: "阿塞拜疆",
  KAZ: "哈萨克斯坦",
  UZB: "乌兹别克斯坦",
  TKM: "土库曼斯坦",
  KGZ: "吉尔吉斯斯坦",
  TJK: "塔吉克斯坦",
  AFG: "阿富汗",
  IRN: "伊朗",
  IRQ: "伊拉克",
  SYR: "叙利亚",
  JOR: "约旦",
  LBN: "黎巴嫩",
  ISR: "以色列",
  SAU: "沙特阿拉伯",
  ARE: "阿联酋",
  QAT: "卡塔尔",
  KWT: "科威特",
  OMN: "阿曼",
  YEM: "也门",
  EGY: "埃及",
  DZA: "阿尔及利亚",
  MAR: "摩洛哥",
  TUN: "突尼斯",
  LBY: "利比亚",
  SDN: "苏丹",
  SSD: "南苏丹",
  ETH: "埃塞俄比亚",
  SOM: "索马里",
  DJI: "吉布提",
  ERI: "厄立特里亚",
  KEN: "肯尼亚",
  UGA: "乌干达",
  TZA: "坦桑尼亚",
  RWA: "卢旺达",
  BDI: "布隆迪",
  COD: "刚果（金）",
  COG: "刚果（布）",
  GAB: "加蓬",
  CMR: "喀麦隆",
  NGA: "尼日利亚",
  GHA: "加纳",
  CIV: "科特迪瓦",
  SEN: "塞内加尔",
  MLI: "马里",
  NER: "尼日尔",
  TCD: "乍得",
  ZAF: "南非",
  NAM: "纳米比亚",
  BWA: "博茨瓦纳",
  ZMB: "赞比亚",
  ZWE: "津巴布韦",
  MOZ: "莫桑比克",
  MDG: "马达加斯加",
  AGO: "安哥拉",
  IND: "印度",
  PAK: "巴基斯坦",
  BGD: "孟加拉国",
  NPL: "尼泊尔",
  BTN: "不丹",
  LKA: "斯里兰卡",
  MMR: "缅甸",
  THA: "泰国",
  LAO: "老挝",
  KHM: "柬埔寨",
  VNM: "越南",
  MYS: "马来西亚",
  SGP: "新加坡",
  IDN: "印度尼西亚",
  PHL: "菲律宾",
  BRN: "文莱",
  TLS: "东帝汶",
  JPN: "日本",
  KOR: "韩国",
  PRK: "朝鲜",
  MNG: "蒙古",
  AUS: "澳大利亚",
  NZL: "新西兰",
  PNG: "巴布亚新几内亚",
  FJI: "斐济",
  CUB: "古巴",
  HTI: "海地",
  DOM: "多米尼加",
  JAM: "牙买加",
  GTM: "危地马拉",
  BLZ: "伯利兹",
  HND: "洪都拉斯",
  SLV: "萨尔瓦多",
  NIC: "尼加拉瓜",
  CRI: "哥斯达黎加",
  PAN: "巴拿马",
  BMU: "百慕大",
  GRL: "格陵兰",
  MLT: "马耳他",
  CYP: "塞浦路斯",
  BHS: "巴哈马",
  BRB: "巴巴多斯",
  TTO: "特立尼达和多巴哥",
  MUS: "毛里求斯",
  SYC: "塞舌尔"
};

const COUNTRY_TIMEZONE_BY_ISO3 = {
  CHN: "Asia/Shanghai",
  USA: "America/New_York",
  CAN: "America/Toronto",
  MEX: "America/Mexico_City",
  BRA: "America/Sao_Paulo",
  ARG: "America/Argentina/Buenos_Aires",
  CHL: "America/Santiago",
  COL: "America/Bogota",
  PER: "America/Lima",
  VEN: "America/Caracas",
  BOL: "America/La_Paz",
  ECU: "America/Guayaquil",
  URY: "America/Montevideo",
  PRY: "America/Asuncion",
  GUY: "America/Guyana",
  SUR: "America/Paramaribo",
  GBR: "Europe/London",
  IRL: "Europe/Dublin",
  FRA: "Europe/Paris",
  DEU: "Europe/Berlin",
  ESP: "Europe/Madrid",
  PRT: "Europe/Lisbon",
  ITA: "Europe/Rome",
  NLD: "Europe/Amsterdam",
  BEL: "Europe/Brussels",
  CHE: "Europe/Zurich",
  AUT: "Europe/Vienna",
  POL: "Europe/Warsaw",
  CZE: "Europe/Prague",
  SVK: "Europe/Bratislava",
  HUN: "Europe/Budapest",
  ROU: "Europe/Bucharest",
  BGR: "Europe/Sofia",
  GRC: "Europe/Athens",
  NOR: "Europe/Oslo",
  SWE: "Europe/Stockholm",
  FIN: "Europe/Helsinki",
  DNK: "Europe/Copenhagen",
  ISL: "Atlantic/Reykjavik",
  RUS: "Europe/Moscow",
  UKR: "Europe/Kyiv",
  BLR: "Europe/Minsk",
  EST: "Europe/Tallinn",
  LVA: "Europe/Riga",
  LTU: "Europe/Vilnius",
  TUR: "Europe/Istanbul",
  GEO: "Asia/Tbilisi",
  ARM: "Asia/Yerevan",
  AZE: "Asia/Baku",
  KAZ: "Asia/Almaty",
  UZB: "Asia/Tashkent",
  TKM: "Asia/Ashgabat",
  KGZ: "Asia/Bishkek",
  TJK: "Asia/Dushanbe",
  AFG: "Asia/Kabul",
  IRN: "Asia/Tehran",
  IRQ: "Asia/Baghdad",
  SYR: "Asia/Damascus",
  JOR: "Asia/Amman",
  LBN: "Asia/Beirut",
  ISR: "Asia/Jerusalem",
  SAU: "Asia/Riyadh",
  ARE: "Asia/Dubai",
  QAT: "Asia/Qatar",
  KWT: "Asia/Kuwait",
  OMN: "Asia/Muscat",
  YEM: "Asia/Aden",
  EGY: "Africa/Cairo",
  DZA: "Africa/Algiers",
  MAR: "Africa/Casablanca",
  TUN: "Africa/Tunis",
  LBY: "Africa/Tripoli",
  SDN: "Africa/Khartoum",
  SSD: "Africa/Juba",
  ETH: "Africa/Addis_Ababa",
  SOM: "Africa/Mogadishu",
  DJI: "Africa/Djibouti",
  ERI: "Africa/Asmara",
  KEN: "Africa/Nairobi",
  UGA: "Africa/Kampala",
  TZA: "Africa/Dar_es_Salaam",
  RWA: "Africa/Kigali",
  BDI: "Africa/Bujumbura",
  COD: "Africa/Kinshasa",
  COG: "Africa/Brazzaville",
  GAB: "Africa/Libreville",
  CMR: "Africa/Douala",
  NGA: "Africa/Lagos",
  GHA: "Africa/Accra",
  CIV: "Africa/Abidjan",
  SEN: "Africa/Dakar",
  MLI: "Africa/Bamako",
  NER: "Africa/Niamey",
  TCD: "Africa/Ndjamena",
  ZAF: "Africa/Johannesburg",
  NAM: "Africa/Windhoek",
  BWA: "Africa/Gaborone",
  ZMB: "Africa/Lusaka",
  ZWE: "Africa/Harare",
  MOZ: "Africa/Maputo",
  MDG: "Indian/Antananarivo",
  AGO: "Africa/Luanda",
  IND: "Asia/Kolkata",
  PAK: "Asia/Karachi",
  BGD: "Asia/Dhaka",
  NPL: "Asia/Kathmandu",
  BTN: "Asia/Thimphu",
  LKA: "Asia/Colombo",
  MMR: "Asia/Yangon",
  THA: "Asia/Bangkok",
  LAO: "Asia/Vientiane",
  KHM: "Asia/Phnom_Penh",
  VNM: "Asia/Ho_Chi_Minh",
  MYS: "Asia/Kuala_Lumpur",
  SGP: "Asia/Singapore",
  IDN: "Asia/Jakarta",
  PHL: "Asia/Manila",
  BRN: "Asia/Brunei",
  TLS: "Asia/Dili",
  JPN: "Asia/Tokyo",
  KOR: "Asia/Seoul",
  PRK: "Asia/Pyongyang",
  MNG: "Asia/Ulaanbaatar",
  AUS: "Australia/Sydney",
  NZL: "Pacific/Auckland",
  PNG: "Pacific/Port_Moresby",
  FJI: "Pacific/Fiji",
  CUB: "America/Havana",
  HTI: "America/Port-au-Prince",
  DOM: "America/Santo_Domingo",
  JAM: "America/Jamaica",
  GTM: "America/Guatemala",
  BLZ: "America/Belize",
  HND: "America/Tegucigalpa",
  SLV: "America/El_Salvador",
  NIC: "America/Managua",
  CRI: "America/Costa_Rica",
  PAN: "America/Panama",
  BMU: "Atlantic/Bermuda",
  GRL: "America/Nuuk",
  MLT: "Europe/Malta",
  CYP: "Asia/Nicosia",
  BHS: "America/Nassau",
  BRB: "America/Barbados",
  TTO: "America/Port_of_Spain",
  MUS: "Indian/Mauritius",
  SYC: "Indian/Mahe"
};

function normalizeSearchText(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
}

function normalizeIso3Code(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return "";
  return code;
}

function getFeatureIso3(feature) {
  const props = feature?.properties || {};
  const candidates = [
    feature?.id,
    props.ISO_A3,
    props.iso_a3,
    props.ADM0_A3,
    props.adm0_a3,
    props.SOV_A3,
    props.sov_a3,
    props.GU_A3,
    props.gu_a3,
  ];
  for (const value of candidates) {
    const iso3 = normalizeIso3Code(value);
    if (iso3) return iso3;
  }
  return "";
}

function normalizeGeoJSONFeatureIds(geojson) {
  if (!geojson?.features?.length) {
    return { geojson, iso3Coverage: 0 };
  }

  let resolved = 0;
  const features = geojson.features.map((feature) => {
    const iso3 = getFeatureIso3(feature);
    if (!iso3) return feature;
    resolved += 1;
    return feature.id === iso3 ? feature : { ...feature, id: iso3 };
  });

  return {
    geojson: { ...geojson, features },
    iso3Coverage: resolved / features.length,
  };
}

function buildSearchIndex(geojson) {
  searchIndex = geojson.features.map((feature) => {
    const iso3 = getFeatureIso3(feature);
    const englishName = feature.properties?.name || "Unknown";
    const zhName = COUNTRY_NAME_ZH[iso3] || "";
    const displayName = getDisplayCountryName(iso3, englishName);
    const displayKey = normalizeSearchText(displayName);
    const englishKey = normalizeSearchText(englishName);
    const zhKey = normalizeSearchText(zhName);
    const isoKey = normalizeSearchText(iso3);
    const combined = `${displayKey} ${englishKey} ${zhKey} ${isoKey}`;
    return {
      iso3,
      feature,
      displayName,
      englishName,
      zhName,
      displayKey,
      englishKey,
      zhKey,
      isoKey,
      searchKey: normalizeSearchText(combined),
    };
  });
}

function getOffsetByFeature(feature) {
  const iso3 = getFeatureIso3(feature);
  const timeZone = COUNTRY_TIMEZONE_BY_ISO3[iso3];
  if (timeZone) {
    const offsetMinutes = getOffsetMinutesByTimeZone(timeZone);
    if (offsetMinutes !== null) {
      return { offsetMinutes, timeZone, isEstimated: false };
    }
  }
  const centroid = d3.geoCentroid(feature);
  return {
    offsetMinutes: getOffsetMinutesByLongitude(centroid[0] || 0),
    timeZone: "",
    isEstimated: true,
  };
}

function setSelectedCountry(iso3) {
  selectedCountryId = iso3 || null;
  if (globeState?.countries) {
    globeState.countries.classed(
      "country-selected",
      (d) => getFeatureIso3(d) === selectedCountryId
    );
  }
}

function isHoverFrozen() {
  return Date.now() < hoverFreezeUntil;
}

function showCountryTime(feature) {
  const iso3 = getFeatureIso3(feature);
  const englishName = feature?.properties?.name || "Unknown";
  const countryName = getDisplayCountryName(iso3, englishName);
  const timeContext = getOffsetByFeature(feature);
  const shouldRestartClock = !currentHover || currentHover.iso3 !== iso3;
  currentHover = { iso3, countryName, ...timeContext };
  if (shouldRestartClock) {
    startClock();
    return;
  }
  updateTooltip(countryName, timeContext);
}

function focusCountry(item) {
  if (!item || !globeState?.projection || !globeState?.redraw) return;
  const centroid = d3.geoCentroid(item.feature);
  globeState.projection.rotate([-centroid[0], -centroid[1], 0]);
  globeState.redraw();
  setSelectedCountry(item.iso3);

  showCountryTime(item.feature);
}

function closeSearchResults() {
  if (!searchResults) return;
  searchActiveIndex = -1;
  searchCurrentItems = [];
  searchResults.innerHTML = "";
  searchResults.classList.remove("open");
  if (searchInput) {
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }
}

function renderSearchResults(items) {
  if (!searchResults) return;
  searchCurrentItems = items.slice(0, 8);
  searchActiveIndex = searchCurrentItems.length ? 0 : -1;
  searchResults.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "search-item-empty";
    empty.textContent = "未找到匹配国家";
    searchResults.appendChild(empty);
    searchResults.classList.add("open");
    if (searchInput) {
      searchInput.setAttribute("aria-expanded", "true");
    }
    return;
  }

  searchCurrentItems.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-item";
    btn.setAttribute("role", "option");
    btn.id = `search-option-${index}`;
    btn.setAttribute("aria-selected", index === searchActiveIndex ? "true" : "false");
    if (index === searchActiveIndex) {
      btn.classList.add("active");
    }
    btn.textContent = `${item.displayName} (${item.iso3})`;
    btn.addEventListener("mouseenter", () => {
      setSearchActiveIndex(index);
    });
    btn.addEventListener("click", () => {
      focusCountry(item);
      if (searchInput) {
        searchInput.value = item.displayName;
      }
      closeSearchResults();
    });
    searchResults.appendChild(btn);
  });

  searchResults.classList.add("open");
  if (searchInput) {
    searchInput.setAttribute("aria-expanded", "true");
  }
  setSearchActiveIndex(searchActiveIndex);
}

function setSearchActiveIndex(index) {
  if (!searchInput || !searchResults || !searchCurrentItems.length) return;
  searchActiveIndex = Math.max(0, Math.min(searchCurrentItems.length - 1, index));
  const options = Array.from(searchResults.querySelectorAll(".search-item"));
  options.forEach((option, optionIndex) => {
    const active = optionIndex === searchActiveIndex;
    option.classList.toggle("active", active);
    option.setAttribute("aria-selected", active ? "true" : "false");
  });
  searchInput.setAttribute("aria-activedescendant", `search-option-${searchActiveIndex}`);
}

function getSearchScore(item, normalized) {
  if (!normalized) return Number.POSITIVE_INFINITY;
  if (item.isoKey === normalized) return 0;
  if (item.zhKey && item.zhKey === normalized) return 1;
  if (item.englishKey === normalized || item.displayKey === normalized) return 2;
  if (item.isoKey.startsWith(normalized)) return 3;
  if (item.zhKey && item.zhKey.startsWith(normalized)) return 4;
  if (item.englishKey.startsWith(normalized) || item.displayKey.startsWith(normalized)) {
    return 5;
  }
  if (item.searchKey.includes(normalized)) return 8 + item.searchKey.indexOf(normalized);
  return Number.POSITIVE_INFINITY;
}

function findMatches(keyword) {
  const normalized = normalizeSearchText(keyword);
  if (!normalized) return [];
  return searchIndex
    .map((item) => ({ item, score: getSearchScore(item, normalized) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.item.displayName.localeCompare(b.item.displayName, "zh-CN");
    })
    .map((entry) => entry.item);
}

function initSearch() {
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      closeSearchResults();
      return;
    }
    const matches = findMatches(keyword);
    renderSearchResults(matches);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      if (!searchCurrentItems.length) return;
      event.preventDefault();
      setSearchActiveIndex(searchActiveIndex + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      if (!searchCurrentItems.length) return;
      event.preventDefault();
      setSearchActiveIndex(searchActiveIndex - 1);
      return;
    }
    if (event.key === "Escape") {
      closeSearchResults();
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    const selected = searchCurrentItems[searchActiveIndex] || findMatches(keyword)[0];
    if (selected) {
      focusCountry(selected);
      searchInput.value = selected.displayName;
      closeSearchResults();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target === searchInput || searchResults.contains(target)) return;
    closeSearchResults();
  });
}

function formatOffsetLabel(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hh}:${mm}`;
}

function getOffsetMinutesByLongitude(longitude) {
  // Use 30-minute steps to better match real world offsets while staying offline.
  const rawOffsetHours = longitude / 15;
  const roundedHalfHours = Math.round(rawOffsetHours * 2);
  const offsetMinutes = roundedHalfHours * 30;
  return Math.max(-12 * 60, Math.min(14 * 60, offsetMinutes));
}

function formatTimeByOffset(offsetMinutes) {
  const shifted = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return utcFormatter.format(shifted);
}

function getTimeZoneFormatter(timeZone) {
  if (!formatterByTimeZone.has(timeZone)) {
    formatterByTimeZone.set(
      timeZone,
      new Intl.DateTimeFormat("zh-CN", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }
  return formatterByTimeZone.get(timeZone);
}

function getOffsetMinutesByTimeZone(timeZone, date = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = dtf.formatToParts(date);
    const map = {};
    parts.forEach((part) => {
      if (part.type !== "literal") {
        map[part.type] = part.value;
      }
    });
    const asUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return null;
  }
}

function getDisplayCountryName(iso3, englishName) {
  const zhName = COUNTRY_NAME_ZH[iso3];
  return zhName ? `${zhName} / ${englishName}` : englishName;
}

function formatTimeByContext(timeContext) {
  if (timeContext.timeZone) {
    return getTimeZoneFormatter(timeContext.timeZone).format(new Date());
  }
  return formatTimeByOffset(timeContext.offsetMinutes);
}

function updateTooltip(countryName, timeContext) {
  tooltipCountry.textContent = countryName;
  const zoneLabel = timeContext.timeZone
    ? `国家时区: ${timeContext.timeZone}`
    : "国家时区(估算)";
  tooltipZone.textContent = `${zoneLabel} (${formatOffsetLabel(timeContext.offsetMinutes)})`;
  tooltipTime.textContent = formatTimeByContext(timeContext);
}

function announceCountry(countryName, timeContext) {
  if (!srAnnouncer) return;
  srAnnouncer.textContent = `${countryName}，${formatOffsetLabel(timeContext.offsetMinutes)}`;
}

function startClock() {
  clearInterval(clockTimerId);
  if (!currentHover) return;
  const timeContext = {
    offsetMinutes: currentHover.offsetMinutes,
    timeZone: currentHover.timeZone,
    isEstimated: currentHover.isEstimated,
  };
  updateTooltip(currentHover.countryName, timeContext);
  announceCountry(currentHover.countryName, timeContext);

  clockTimerId = setInterval(() => {
    if (!currentHover) return;
    if (currentHover.timeZone) {
      const nextOffset = getOffsetMinutesByTimeZone(currentHover.timeZone);
      if (nextOffset !== null) {
        currentHover.offsetMinutes = nextOffset;
      }
    }
    const nextContext = {
      offsetMinutes: currentHover.offsetMinutes,
      timeZone: currentHover.timeZone,
      isEstimated: currentHover.isEstimated,
    };
    updateTooltip(currentHover.countryName, nextContext);
  }, 1000);
}

function resetTooltip() {
  tooltipCountry.textContent = "将鼠标移到国家上";
  tooltipTime.textContent = browserFormatter.format(new Date());
  tooltipZone.textContent = `浏览器时区: ${browserTimeZone}`;
}

function getItemFromInputValue(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return null;
  const normalized = normalizeSearchText(value);
  if (!normalized) return null;
  const isoLike = normalizeIso3Code(value);
  if (isoLike) {
    const byIso = searchIndex.find((item) => item.iso3 === isoLike);
    if (byIso) return byIso;
  }
  return findMatches(value)[0] || null;
}

function formatMinutesToHHMM(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toUtcSegments(startMinutes, endMinutes) {
  const start = ((startMinutes % 1440) + 1440) % 1440;
  const end = ((endMinutes % 1440) + 1440) % 1440;
  if (start < end) return [[start, end]];
  return [
    [start, 1440],
    [0, end],
  ];
}

function getWorkingOverlap(offsetA, offsetB) {
  const aUtcStart = 9 * 60 - offsetA;
  const aUtcEnd = 18 * 60 - offsetA;
  const bUtcStart = 9 * 60 - offsetB;
  const bUtcEnd = 18 * 60 - offsetB;
  const aSegments = toUtcSegments(aUtcStart, aUtcEnd);
  const bSegments = toUtcSegments(bUtcStart, bUtcEnd);
  const overlaps = [];
  for (const aSeg of aSegments) {
    for (const bSeg of bSegments) {
      const start = Math.max(aSeg[0], bSeg[0]);
      const end = Math.min(aSeg[1], bSeg[1]);
      if (end > start) overlaps.push([start, end]);
    }
  }
  if (!overlaps.length) return null;
  overlaps.sort((x, y) => x[0] - y[0]);
  return overlaps[0];
}

function updateCompareCard() {
  if (!compareOutput || !compareInputA || !compareInputB) return;
  const itemA = getItemFromInputValue(compareInputA.value);
  const itemB = getItemFromInputValue(compareInputB.value);

  if (!itemA || !itemB) {
    compareOutput.innerHTML = "<div>输入两个国家后自动计算</div>";
    return;
  }

  const ctxA = getOffsetByFeature(itemA.feature);
  const ctxB = getOffsetByFeature(itemB.feature);
  const timeA = formatTimeByContext(ctxA);
  const timeB = formatTimeByContext(ctxB);
  const diffMinutes = ctxB.offsetMinutes - ctxA.offsetMinutes;
  const diffAbs = Math.abs(diffMinutes);
  const diffHours = Math.floor(diffAbs / 60);
  const diffRest = diffAbs % 60;
  const direction =
    diffMinutes === 0 ? "时间一致" : diffMinutes > 0 ? "快" : "慢";
  const overlap = getWorkingOverlap(ctxA.offsetMinutes, ctxB.offsetMinutes);

  const overlapLine = overlap
    ? `工作重叠：A ${formatMinutesToHHMM(overlap[0] + ctxA.offsetMinutes)}-${formatMinutesToHHMM(overlap[1] + ctxA.offsetMinutes)} / B ${formatMinutesToHHMM(overlap[0] + ctxB.offsetMinutes)}-${formatMinutesToHHMM(overlap[1] + ctxB.offsetMinutes)}`
    : "工作重叠：几乎没有（以 09:00-18:00 为基准）";

  const diffText =
    diffMinutes === 0
      ? "两地时差：0 小时"
      : `两地时差：${itemB.displayName}比${itemA.displayName}${direction} ${diffHours}小时${diffRest ? `${diffRest}分` : ""}`;

  compareOutput.innerHTML = `
    <div><strong>A</strong> ${itemA.displayName}：${timeA}</div>
    <div><strong>B</strong> ${itemB.displayName}：${timeB}</div>
    <div>${diffText}</div>
    <div>${overlapLine}</div>
  `;
}

function initCompareCard() {
  if (
    !compareInputA ||
    !compareInputB ||
    !compareOutput ||
    !compareResultsA ||
    !compareResultsB
  ) {
    return;
  }

  function closeCompareSuggestions(state) {
    if (!state?.input || !state?.results) return;
    state.items = [];
    state.activeIndex = -1;
    state.results.innerHTML = "";
    state.results.classList.remove("open");
    state.input.setAttribute("aria-expanded", "false");
    state.input.removeAttribute("aria-activedescendant");
  }

  function setCompareActiveIndex(state, index) {
    if (!state?.input || !state?.results || !state.items.length) return;
    state.activeIndex = Math.max(0, Math.min(state.items.length - 1, index));
    const options = Array.from(state.results.querySelectorAll(".search-item"));
    options.forEach((option, optionIndex) => {
      const active = optionIndex === state.activeIndex;
      option.classList.toggle("active", active);
      option.setAttribute("aria-selected", active ? "true" : "false");
    });
    state.input.setAttribute("aria-activedescendant", `${state.idPrefix}-${state.activeIndex}`);
  }

  function selectCompareItem(state, item, shouldFocusCountry = true) {
    if (!state?.input || !item) return;
    state.input.value = item.displayName;
    closeCompareSuggestions(state);
    if (shouldFocusCountry) {
      focusCountry(item);
    }
    updateCompareCard();
  }

  function renderCompareSuggestions(state, items) {
    if (!state?.input || !state?.results) return;
    state.items = items.slice(0, 8);
    state.activeIndex = state.items.length ? 0 : -1;
    state.results.innerHTML = "";

    if (!state.items.length) {
      const empty = document.createElement("div");
      empty.className = "search-item-empty";
      empty.textContent = "未找到匹配国家";
      state.results.appendChild(empty);
      state.results.classList.add("open");
      state.input.setAttribute("aria-expanded", "true");
      return;
    }

    state.items.forEach((item, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-item";
      btn.setAttribute("role", "option");
      btn.id = `${state.idPrefix}-${index}`;
      btn.textContent = `${item.displayName} (${item.iso3})`;
      btn.addEventListener("mouseenter", () => setCompareActiveIndex(state, index));
      btn.addEventListener("click", () => selectCompareItem(state, item));
      state.results.appendChild(btn);
    });

    state.results.classList.add("open");
    state.input.setAttribute("aria-expanded", "true");
    setCompareActiveIndex(state, state.activeIndex);
  }

  function bindCompareSuggest(state) {
    state.input.addEventListener("input", () => {
      const keyword = state.input.value.trim();
      if (!keyword) {
        closeCompareSuggestions(state);
        updateCompareCard();
        return;
      }
      renderCompareSuggestions(state, findMatches(keyword));
      updateCompareCard();
    });

    state.input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        if (!state.items.length) return;
        event.preventDefault();
        setCompareActiveIndex(state, state.activeIndex + 1);
        return;
      }
      if (event.key === "ArrowUp") {
        if (!state.items.length) return;
        event.preventDefault();
        setCompareActiveIndex(state, state.activeIndex - 1);
        return;
      }
      if (event.key === "Escape") {
        closeCompareSuggestions(state);
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      const selected = state.items[state.activeIndex] || findMatches(state.input.value)[0];
      if (selected) {
        selectCompareItem(state, selected);
      } else {
        updateCompareCard();
      }
    });
  }

  compareSuggestA = {
    input: compareInputA,
    results: compareResultsA,
    idPrefix: "compare-option-a",
    items: [],
    activeIndex: -1,
  };

  compareSuggestB = {
    input: compareInputB,
    results: compareResultsB,
    idPrefix: "compare-option-b",
    items: [],
    activeIndex: -1,
  };

  bindCompareSuggest(compareSuggestA);
  bindCompareSuggest(compareSuggestB);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (
      target === compareInputA ||
      target === compareInputB ||
      compareResultsA.contains(target) ||
      compareResultsB.contains(target)
    ) {
      return;
    }
    closeCompareSuggestions(compareSuggestA);
    closeCompareSuggestions(compareSuggestB);
  });

  compareInputA.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement !== compareInputA) {
        closeCompareSuggestions(compareSuggestA);
      }
    }, 50);
  });

  compareInputB.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement !== compareInputB) {
        closeCompareSuggestions(compareSuggestB);
      }
    }, 50);
  });
}

function getSubsolarPoint(date) {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const nowUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );

  const dayOfYear = (nowUtc - startOfYear) / 86400000;
  const axialTilt = 23.44;
  const solarDeclination =
    axialTilt * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));

  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const subsolarLongitude = ((12 - utcHours) * 15 + 540) % 360 - 180;

  return [subsolarLongitude, solarDeclination];
}

function reversePolygonRings(coordinates) {
  return coordinates.map((ring) => [...ring].reverse());
}

function normalizeFeatureGeometry(feature) {
  if (!feature?.geometry) return feature;
  const area = d3.geoArea(feature);
  if (area <= 2 * Math.PI) return feature;

  const geometry = feature.geometry;
  if (geometry.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: reversePolygonRings(geometry.coordinates),
      },
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) => reversePolygonRings(polygon)),
      },
    };
  }

  return feature;
}

function normalizeGeoJSON(geojson) {
  if (!geojson?.features) return geojson;
  const normalizedGeometry = {
    ...geojson,
    features: geojson.features.map((feature) => normalizeFeatureGeometry(feature)),
  };
  return normalizeGeoJSONFeatureIds(normalizedGeometry).geojson;
}

async function fetchGeoJSON() {
  const errors = [];
  for (const url of GEOJSON_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.type === "Topology" && window.topojson?.feature) {
        const objName = Object.keys(data.objects || {})[0];
        if (objName) {
          const asGeoJSON = window.topojson.feature(data, data.objects[objName]);
          const normalized = normalizeGeoJSONFeatureIds(asGeoJSON);
          if (normalized.iso3Coverage < 0.6) {
            throw new Error(
              `Geo source lacks ISO3 ids (coverage ${(normalized.iso3Coverage * 100).toFixed(1)}%)`
            );
          }
          return normalized.geojson;
        }
      }
      if (data?.type === "FeatureCollection") {
        const normalized = normalizeGeoJSONFeatureIds(data);
        if (normalized.iso3Coverage < 0.6) {
          throw new Error(
            `Geo source lacks ISO3 ids (coverage ${(normalized.iso3Coverage * 100).toFixed(1)}%)`
          );
        }
        return normalized.geojson;
      }
      throw new Error("Unsupported geo format");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${url} -> ${message}`);
    }
  }
  throw new Error(errors.join(" | "));
}

function renderGlobe(geojson) {
  if (globeState?.stopAutoRotate) {
    globeState.stopAutoRotate();
  }
  cancelAnimationFrame(autoRotateTimerId);

  const { width } = mapContainer.getBoundingClientRect();
  const height = mapContainer.clientHeight;

  d3.select("#map").selectAll("*").remove();

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const radius = Math.min(width, height) * 0.44;
  const projection = d3
    .geoOrthographic()
    .scale(radius)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([-10, -20]);

  const path = d3.geoPath(projection);
  const sphere = { type: "Sphere" };
  const graticule = d3.geoGraticule10();
  let activeTouches = [];
  let cachedNightPolygon = null;
  let lastSolarAt = 0;
  const SOLAR_UPDATE_INTERVAL_MS = 250;
  let isAutoRotating = false;
  const autoRotateDegreesPerMs = 0.003;

  function startAutoRotate() {
    if (isAutoRotating || document.hidden) return;
    isAutoRotating = true;
    let lastTs = 0;
    const step = (ts) => {
      if (!isAutoRotating || document.hidden) {
        isAutoRotating = false;
        return;
      }
      if (!lastTs) {
        lastTs = ts;
      }
      const delta = ts - lastTs;
      lastTs = ts;
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + delta * autoRotateDegreesPerMs, rotate[1], rotate[2]]);
      redraw();
      autoRotateTimerId = requestAnimationFrame(step);
    };
    autoRotateTimerId = requestAnimationFrame(step);
  }

  function stopAutoRotate() {
    isAutoRotating = false;
    cancelAnimationFrame(autoRotateTimerId);
  }

  const globeLayer = svg.append("g").attr("class", "globe-layer");
  const ocean = globeLayer.append("path").attr("class", "globe-sphere");
  const grid = globeLayer.append("path").attr("class", "graticule");
  const countriesLayer = globeLayer.append("g").attr("class", "countries-layer");
  const countries = countriesLayer
    .selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("class", "country")
    .attr("fill-rule", "evenodd")
    .on("mouseenter", function onEnter(_event, d) {
      if (isHoverFrozen()) return;
      showCountryTime(d);
    })
    .on("mousemove", function onMove(_event, d) {
      if (isHoverFrozen()) return;
      const iso3 = getFeatureIso3(d);
      if (currentHover?.iso3 === iso3) return;
      showCountryTime(d);
    })
    .on("mousedown", function onMouseDown(_event, d) {
      hoverFreezeUntil = Date.now() + HOVER_FREEZE_MS;
      showCountryTime(d);
    })
    .on("click", function onClick(_event, d) {
      const iso3 = getFeatureIso3(d);
      if (!iso3) return;
      setSelectedCountry(iso3);
      showCountryTime(d);
    })
    .on("mouseleave", () => {
      if (isHoverFrozen()) return;
      currentHover = null;
      clearInterval(clockTimerId);
      resetTooltip();
    });

  const daylightLayer = globeLayer.append("g").attr("class", "daylight-layer");
  const night = daylightLayer.append("path").attr("class", "night-mask");
  const terminator = daylightLayer
    .append("path")
    .attr("class", "terminator-line");

  function updateNightPolygon(now) {
    const [subsolarLon, subsolarLat] = getSubsolarPoint(now);
    cachedNightPolygon = d3
      .geoCircle()
      .center([subsolarLon + 180, -subsolarLat])
      .radius(90)
      .precision(0.8)();
    lastSolarAt = now.getTime();
  }

  function drawDaylight() {
    if (!cachedNightPolygon) {
      updateNightPolygon(new Date());
    }
    night.attr("d", path(cachedNightPolygon)).attr("opacity", 0.28);
    terminator.attr(
      "d",
      path({ type: "LineString", coordinates: cachedNightPolygon.coordinates[0] })
    );
  }

  function redraw() {
    ocean.attr("d", path(sphere));
    grid.attr("d", path(graticule));
    countries.attr("d", path);
    const nowMs = Date.now();
    if (nowMs - lastSolarAt >= SOLAR_UPDATE_INTERVAL_MS) {
      updateNightPolygon(new Date(nowMs));
    }
    drawDaylight();
  }

  function rotateByDelta(deltaX, deltaY, sensitivityX = 0.2, sensitivityY = 0.2) {
    const rotate = projection.rotate();
    const nextRotate = [
      rotate[0] + deltaX * sensitivityX,
      Math.max(-90, Math.min(90, rotate[1] - deltaY * sensitivityY)),
      rotate[2],
    ];
    projection.rotate(nextRotate);
    redraw();
  }

  const dragBehavior = d3
    .drag()
    .on("start", () => {
      stopAutoRotate();
    })
    .on("drag", (event) => {
      const rotate = projection.rotate();
      const sensitivity = 0.22;
      const nextRotate = [
        rotate[0] + event.dx * sensitivity,
        Math.max(-90, Math.min(90, rotate[1] - event.dy * sensitivity)),
      ];
      projection.rotate(nextRotate);
      redraw();
    })
    .on("end", () => {
      startAutoRotate();
    });

  svg.call(dragBehavior);

  ocean.on("mousemove", () => {
    if (isHoverFrozen()) return;
    if (currentHover) {
      currentHover = null;
      clearInterval(clockTimerId);
      resetTooltip();
    }
  });

  svg.on("wheel", (event) => {
    if (Math.abs(event.deltaX) < 0.01 && Math.abs(event.deltaY) < 0.01) return;
    event.preventDefault();
    stopAutoRotate();
    rotateByDelta(-event.deltaX, -event.deltaY, 0.18, 0.12);
    startAutoRotate();
  });

  const svgNode = svg.node();
  if (svgNode) {
    svgNode.addEventListener(
      "touchstart",
      (event) => {
        activeTouches = Array.from(event.touches);
      },
      { passive: true }
    );

    svgNode.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length < 2 || activeTouches.length < 2) return;
        const prev = activeTouches;
        const next = Array.from(event.touches);
        const prevCenterX = (prev[0].clientX + prev[1].clientX) / 2;
        const nextCenterX = (next[0].clientX + next[1].clientX) / 2;
        const prevCenterY = (prev[0].clientY + prev[1].clientY) / 2;
        const nextCenterY = (next[0].clientY + next[1].clientY) / 2;
        const dx = nextCenterX - prevCenterX;
        const dy = nextCenterY - prevCenterY;

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          event.preventDefault();
          stopAutoRotate();
          rotateByDelta(dx, dy, 0.26, 0.22);
        }

        activeTouches = next;
      },
      { passive: false }
    );

    svgNode.addEventListener(
      "touchend",
      () => {
        activeTouches = [];
        startAutoRotate();
      },
      { passive: true }
    );

    svgNode.addEventListener(
      "touchcancel",
      () => {
        activeTouches = [];
        startAutoRotate();
      },
      { passive: true }
    );
  }

  startAutoRotate();

  globeState = { projection, redraw, countries, startAutoRotate, stopAutoRotate };

  if (selectedCountryId) {
    const selectedFeature = geojson.features.find(
      (feature) => getFeatureIso3(feature) === selectedCountryId
    );
    if (selectedFeature) {
      const centroid = d3.geoCentroid(selectedFeature);
      projection.rotate([-centroid[0], -centroid[1], 0]);
    }
  }

  setSelectedCountry(selectedCountryId);
  updateNightPolygon(new Date());
  drawDaylight();
  redraw();
}

async function init() {
  try {
    cachedGeojson = normalizeGeoJSON(await fetchGeoJSON());
    buildSearchIndex(cachedGeojson);
    initSearch();
    initCompareCard();

    renderGlobe(cachedGeojson);
    resetTooltip();
    updateCompareCard();

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimerId);
      resizeTimerId = setTimeout(() => {
        if (cachedGeojson) {
          renderGlobe(cachedGeojson);
        }
      }, 120);
    });
    document.addEventListener("visibilitychange", () => {
      if (!globeState) return;
      if (document.hidden) {
        globeState.stopAutoRotate();
        return;
      }
      globeState.startAutoRotate();
    });

    setInterval(updateCompareCard, 1000);
  } catch (error) {
    tooltipCountry.textContent = "地图加载失败";
    tooltipTime.textContent = "请检查网络/脚本加载";
    tooltipZone.textContent = error instanceof Error ? error.message : "未知错误";
  }
}

init();
