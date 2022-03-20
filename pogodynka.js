let weather = {
	"apiKey": "bad6e097930f7967509f972acfb82c85",
	fetchWeather: (city) => {
		fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${weather.apiKey}&units=metric&q=${city}&lang=pl`).then((response) => response.json()).then((data) => weather.displayWeather(data));
	},
	fetchArea: (lon, lat) => {
		fetch(`https://api.openweathermap.org/data/2.5/find?appid=${weather.apiKey}&units=metric&lang=pl&lon=${lon}&lat=${lat}&cnt=10`).then((response) => response.json()).then((data) => weather.displayArea(data));
	},
	displayWeather: (data) => {
		const { cod } = data;
		if (cod != 200) {
			document.querySelector(".error").innerText = data.message;
			document.querySelector(".error").classList.remove("hidden");
			return;
		}
		const { name } = data;
		const { icon, description } = data.weather[0];
		const { temp, humidity } = data.main;
		const { speed } = data.wind;


		document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
		document.querySelector(".city").innerText = name;
		document.querySelector(".temp").innerText = `${temp}°C`;
		document.querySelector(".description").innerText = `${Capitalize(description)}`;
		document.querySelector(".humidity").innerText = `Wilgotność: ${humidity}%`;
		document.querySelector(".wind").innerText = `Prędkość wiatru: ${speed}m/s`;
		document.querySelector(".weather").classList.remove("hidden");
	},
	displayArea: (data) => {
		data.array.forEach(element => {

		});
	},
	search: () => {
		document.querySelector(".weather").classList.add("hidden");
		document.querySelector(".error").classList.add("hidden");
		let city = document.querySelector(".search-bar").value;
		weather.fetchWeather(city);
	}
}

function bind(el, data, appTitleToCityName = false) {
	const {
		name,
		//"coord":{lon,lat},
		"weather": [{ description, icon }],
		"main": { temp, temp_min, temp_max, feels_like, pressure, humidity },
		"sys": { sunrise, sunset },
		timezone
	} = data;

	let now = new Date();
	if (appTitleToCityName) binding.appBarTitle.innerText = `${name} (${dateFormatHHMM(now.getTime() / 1000 + now.getTimezoneOffset() * 60 + timezone)})`;

	el.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
	el.querySelector(".city-name").innerText = name;
	el.querySelector(".place-time").innerText = `(${dateFormatHHMM(now.getTime() / 1000 + now.getTimezoneOffset() * 60 + timezone)})`;
	el.querySelector(".description").innerText = description;
	el.querySelector(".temp").innerText = `${temp}°C`;
	el.querySelector(".temp-min").innerText = `${temp_min}°C`;
	el.querySelector(".temp-max").innerText = `${temp_max}°C`;
	el.querySelector(".temp-feels").innerText = `${feels_like}°C`;
	el.querySelector(".pressure").innerText = `${pressure} hPa`;
	el.querySelector(".humidity").innerText = `${humidity} %`;
	el.querySelector(".sunrise").innerText = dateFormatHHMM(sunrise);
	el.querySelector(".sunset").innerText = dateFormatHHMM(sunset);
	/*
			console.log(icon);
			console.log(temp_min);
			console.log(temp_max);
			console.log(description);
			console.log(pressure);
			console.log(humidity);
			console.log(sunrise);
			console.log(sunset);*/
}

const SEARCH_FRAGMENT = document.getElementById("search-fragment");
const CITY_FRAGMENT = document.getElementById("city-fragment");
const LIST_FRAGMENT = document.getElementById("list-fragment");
const PLACE_ITEM_TEMPLATE = document.getElementById("place-item-template");
PLACE_ITEM_TEMPLATE.parentElement.removeChild(PLACE_ITEM_TEMPLATE);
PLACE_ITEM_TEMPLATE.removeAttribute("id");

binding = {
	searchBar: document.querySelector("#search-window input"),
	buttonSearchPlace: document.querySelector("#search-place"),
	buttonSearchArea: document.querySelector("#search-area"),
	appBarBack: document.querySelector("#appbar .return"),
	appBarMore: document.querySelector("#appbar .more"),
	appBarTitle: document.querySelector("#title"),
	placeList: document.querySelector("#list-fragment .place-list"),
}

app = {
	processing: false,
	currentFragment: SEARCH_FRAGMENT,
	onClickSearchPlace: () => {
		if (app.processing) return
		app.processing = true;

		let city = binding.searchBar.value;
		fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${weather.apiKey}&units=metric&q=${city}&lang=pl`).then((response) => response.json()).then((data) => {
			app.processing = false;
			console.log(data);
			bind(CITY_FRAGMENT, data, true);
			SEARCH_FRAGMENT.classList.add("hidden");
			CITY_FRAGMENT.classList.remove("hidden");
			app.currentFragment = CITY_FRAGMENT;
		});

	},
	onClickSearchArea: () => {
		if (app.processing) return
		app.processing = true;

		let city = binding.searchBar.value;
		fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${weather.apiKey}&q=${city}&lang=pl`).then((response) => response.json()).then((data) => {
			const {
				"coord":{lon,lat},
				cod,
			} = data;
			if (cod == 200) {

				fetch(`https://api.openweathermap.org/data/2.5/find?appid=${weather.apiKey}&units=metric&lang=pl&lon=${lon}&lat=${lat}&cnt=10`).then((response) => response.json()).then((data) => {
					app.processing = false;
					console.log(data);
					
					SEARCH_FRAGMENT.classList.add("hidden");
					LIST_FRAGMENT.classList.remove("hidden");
					app.currentFragment = LIST_FRAGMENT;

					while(binding.placeList.firstChild)
						binding.placeList.removeChild(binding.placeList.lastChild);

					data.list.forEach(d=>{
						let el=PLACE_ITEM_TEMPLATE.cloneNode(true);
						bind(el,d);
						binding.placeList.appendChild(el);
					})


				});

			}
		});



	},
	onClickReturn: () => {
		if (app.currentFragment == CITY_FRAGMENT) {
			CITY_FRAGMENT.classList.add("hidden");
			SEARCH_FRAGMENT.classList.remove("hidden");
			app.currentFragment = SEARCH_FRAGMENT;
			binding.appBarTitle.innerText = "Pogodynka";
		}
		if (app.currentFragment == LIST_FRAGMENT) {
			LIST_FRAGMENT.classList.add("hidden");
			SEARCH_FRAGMENT.classList.remove("hidden");
			app.currentFragment = SEARCH_FRAGMENT;
			binding.appBarTitle.innerText = "Pogodynka";
		}
	},
}

function dateFormatHHMM(secs) {
	let date = new Date(secs * 1000);
	return date.getHours().toString().padStart(2, '0') + ":" +
		date.getMinutes().toString().padStart(2, '0')
}

binding.buttonSearchPlace.addEventListener("click", () => {
	app.onClickSearchPlace();
});
binding.buttonSearchArea.addEventListener("click", () => {
	app.onClickSearchArea();
});
binding.appBarBack.addEventListener("click", () => {
	app.onClickReturn();
});