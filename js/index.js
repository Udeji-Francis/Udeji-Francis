/**
 * list of countries
 * https://free.currencyconverterapi.com/api/v5/currencies
 */

/**
 * list of currencies
 * https://free.currencyconverterapi.com/api/v5/countries
 *
 * convert endpoint
 * https://free.currencyconverterapi.com/api/v5/convert?q=USD_PHP&compact=ultra
 */
//import Database from './database.js';
//import { addToFavorites, getAllFavorites } from './Database.mjs';

class Index {

  constructor() {

    this.state = {
      fromCurrency: 1,
      toCurrency: 0,
      fromCountry: 'USD',
      toCountry: 'NGN',
      listOfCountries: [],
      listOfCurrencies: [],
      exchangeRate: 0,
      indexOfFromCountry: 50,
      indexOfToCountry: 186,
      isLoaded: false
    }

    this.countriesEndpoint = 'https://free.currencyconverterapi.com/api/v5/currencies';
    this.currenciesEndpoint = 'https://free.currencyconverterapi.com/api/v5/countries';
    //this.conversionEndpoint = '../data/conversion.json';

    this.conversionEndpoint = `https://free.currencyconverterapi.com/api/v5/convert?q=${this.state.fromCountry}_${this.state.toCountry}&compact=ultra`;

    //this.getCountries();
    this.getCurrencies();
    this.getConversion();
    this.load();

    const database = new Database();
    this.registerServiceWorker();
  }

  registerServiceWorker() {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js')
        .then(reg => console.log("Service Worker Registered"))
        .catch(err => console.log("error in reg sw.js"));
    }
  }

  async saveConversion(conversion) {
    resolve(this.getConversion());
    let rate = this.state.exchangeRate;
    conversion.rate = rate;
    setTimeout(() => database.addToFavorites(conversion), 5000);
  }

  getConversion() {
    const {fromCountry, toCountry} = this.state;

    fetch(`https://free.currencyconverterapi.com/api/v5/convert?q=${fromCountry}_${toCountry}&compact=ultra`)
      .then(res => res.json())
      .then(conversions => {
        for (const conversion in conversions) {
          this.state.exchangeRate = parseFloat(conversions[conversion]);
          this.state.toCurrency = parseFloat(this.state.exchangeRate * this.state.fromCurrency);

          this.state.isLoaded = true;

          //console.log(this.state)

          // update the DOM
          document.querySelector('#from-currency').value = this.state.toCurrency / this.state.exchangeRate;
          document.querySelector('#to-currency').value = this.state.fromCurrency * this.state.exchangeRate;

          // update the DOM
          document.querySelector('.hl#from').innerHTML = this.state.toCurrency / this.state.exchangeRate;
          document.querySelector('.hl#to').innerHTML = this.state.fromCurrency * this.state.exchangeRate;

          // update the DOM
          document.querySelector('#from-country-text').innerHTML = this.state.listOfCurrencies[this.state.indexOfFromCountry].currencyName;
          document.querySelector('#to-country-text').innerHTML = this.state.listOfCurrencies[this.state.indexOfToCountry].currencyName;

          let from = parseFloat(this.state.toCurrency / this.state.exchangeRate);
          let to = parseFloat(this.state.fromCurrency * this.state.exchangeRate);

          //console.log({from, to}, this.state)
        }
      })
      .catch(error => console.log(`Error fetching conversion endpoint ${error}`));

  }

  setConversion(from, to, isFrom) {
    const { fromCurrency, toCurrency, exchangeRate } = this.state;
    this.state.fromCurrency = from;
    this.state.toCurrency = to;

    if(isFrom) {
      document.querySelector('#to-currency').value = this.state.fromCurrency * this.state.exchangeRate;

      // update the DOM
      document.querySelector('.hl#from').innerHTML = this.state.toCurrency / this.state.exchangeRate;
      document.querySelector('.hl#to').innerHTML = this.state.fromCurrency * this.state.exchangeRate;
    } else {
      // update the DOM
      document.querySelector('#from-currency').value = this.state.toCurrency / this.state.exchangeRate;

      document.querySelector('.hl#from').innerHTML = this.state.toCurrency / this.state.exchangeRate;

      document.querySelector('.hl#to').innerHTML = this.state.fromCurrency * this.state.exchangeRate;
    }

    // console.log(this.state)
  }

  getCountries() {

    fetch(this.countriesEndpoint)
      .then(res => res.json())
      .then(countries => {
        const countriesResults = countries.results;

        for(const countriesResult in countriesResults) {
          let country = countriesResults[countriesResult];
          this.state.listOfCountries.push(country);
          this.renderList(this.state.listOfCountries, 'select');
        }

      })
      .catch(error => console.log(`[Error] => ${error}`))

  }

  load() {
    document.querySelector('.countries-list').innerHTML = `
      <div class="loader">
        <div id="spinner"></div>
      </div>
    `;
  }

  getCurrencies() {

    fetch(this.currenciesEndpoint)
      .then(res => res.json())
      .then(async (currencies) => {
        const currenciesResults = currencies.results;

        for(const currenciesResult in currenciesResults) {
          let currency = currenciesResults[currenciesResult];

          this.state.listOfCurrencies.push(currency);
          await this.renderList(this.state.listOfCurrencies, 'select');
          await this.renderList(this.state.listOfCurrencies, 'list');
        }

      })
      .catch(error => console.log(`[Error] => ${error}`));

  }

  renderList(listOfCurrencies, node) {

    if(node === 'select') {
      const selects = [];
      const rate = 0; //============= remove

      const countriesLists = document.querySelectorAll('.select-country');
      selects.push(...countriesLists);

      countriesLists.forEach(countriesList => {

        countriesList.innerHTML = listOfCurrencies.map((countries, index) => {
          const {currencyId, currencyName} = countries;
          return `
            <option data-index="${index}"
              value="${currencyId}"
              data-currencyname="${currencyName}"
              data-currencyid="${currencyId}"
              data-currencyindex="${index}"
              data-currencyrate="${rate}"
              class="country">${currencyName}</option>
          `;
        }).join('');

        selects[0].selectedIndex = this.state.indexOfFromCountry;
        selects[1].selectedIndex = this.state.indexOfToCountry;

      });

    }

    if(node === 'list') {

      //return;
      const countriesList = document.querySelector('.countries-list');

      countriesList.innerHTML = listOfCurrencies.map((currency, i) => {
        const {currencyId, currencyName} = currency;
        const rate = 200;

        return `
          <li class="countries-list-item" data-id="${currencyId}">

            <div class="country-info">
              <span class="country-flag">
                <img height="50" width="50" src="../img/preview.png" id="country-flag">
              </span>
              <div class="country-name">
                <h3 class="country-shortname">${currencyId}</h3>
                <h5 class="country-currency">${currencyName}</h5>
              </div>
            </div>

            <div class="currency-value">
              <div class="country-favorite">
                <button data-currencyname="${currencyName}" data-currencyid="${currencyId}" data-currencyindex="${i}" data-currencyrate="${rate}" class="fa fa-star btn-favorite"></button>
              </div>
            </div>

          </li>
        `;
      }).join('');
    }

  }

  updateInput(input) {
    if(input.id === 'to-currency') {

      input.value = this.state.fromCurrency * this.state.exchangeRate;
    }

    if(input.id === 'from-currency') {
      input.value = this.state.toCurrency * this.state.exchangeRate;
    }
  }

  updateFavorites() {
    document.querySelector('.countries-fav-list').innerHTML = favorites.map(favorite => {
      const {currencyid, currencyname, currencyrate, id} = favorite;
      return `
        <li class="countries-list-item" data-id="${currencyid}">

          <div class="country-info">
            <span class="country-flag">
              <img height="50" width="50" src="../img/preview.png" id="country-flag">
            </span>
            <div class="country-name">
              <h3 class="country-shortname">${currencyid}</h3>
              <h5 class="country-currency">${currencyname}</h5>
            </div>
          </div>

          <div class="currency-value">
            <div class="country-favorite">
              <button data-currencyname="${currencyname}"
                data-currencyid="${currencyid}"
                data-currencyindex="${id}"
                data-currencyrate="${currencyrate}"
                class="fa fa-close btn-favorite">
              </button>
            </div>
          </div>

        </li>
      `;
    }).join('');
  }

  main() {



    // caching DOM select elements
    const fromCountrySelect = document.querySelector('#from-country');
    const toCountrySelect = document.querySelector('#to-country');

    fromCountrySelect.addEventListener('change', e => {
      let countryId = e.target.value;
      let indexOfFrom = e.target.selectedIndex;

      this.state.indexOfFromCountry = indexOfFrom;
      this.state.fromCountry = countryId;

      this.getConversion();

      let conversion = {
        fromCountryId: countryId,
        toCountryId: this.state.toCountry,
      }

      this.saveConversion(conversion)
    });

    toCountrySelect.addEventListener('change', e => {
      let countryId = e.target.value;
      let indexOfTo = e.target.selectedIndex;

      this.state.indexOfToCountry = indexOfTo;
      this.state.toCountry = countryId;

      this.getConversion();

      let conversion = {
        fromCountryId: this.state.fromCountry,
        toCountryId: countryId,
      }

      this.saveConversion(conversion);
    });


    // caching DOM input elements
    const fromCurrencyInput = document.querySelector('#from-currency');
    fromCurrencyInput.value = this.state.fromCurrency;

    const toCurrencyInput = document.querySelector('#to-currency');
    toCurrencyInput.value = this.state.toCurrency;

    // Listen for keyup event on input element --- from
    fromCurrencyInput.addEventListener('keyup', e => {
      let value = e.target.value;
      this.setConversion(value, this.state.toCurrency, true);
    });

    // Listen for keyup event on input element --- to
    toCurrencyInput.addEventListener('keyup', e => {
      let value = e.target.value;
      this.setConversion(this.state.fromCurrency, value, false);
    });

    document.querySelector('.countries-list').addEventListener('click', e => {
      if(!e.target.classList.contains('btn-favorite')) {
        return;
      } else {
        const currency = {...e.target.dataset};

        database.addToFavorites(currency);
        // this.updateFavorites();
        let favorites = database.get();

        document.querySelector('.countries-fav-list').innerHTML = favorites.map(favorite => {
          const {currencyid, currencyname, currencyrate, id} = favorite;
          return `
            <li class="countries-list-item" data-id="${currencyid}">

              <div class="country-info">
                <span class="country-flag">
                  <img height="50" width="50" src="../img/preview.png" id="country-flag">
                </span>
                <div class="country-name">
                  <h3 class="country-shortname">${currencyid}</h3>
                  <h5 class="country-currency">${currencyname}</h5>
                </div>
              </div>

              <div class="currency-value">
                <div class="country-favorite">
                  <button data-currencyname="${currencyname}"
                    data-currencyid="${currencyid}"
                    data-currencyindex="${id}"
                    data-currencyrate="${currencyrate}"
                    class="fa fa-close btn-favorite">
                  </button>
                </div>
              </div>

            </li>
          `;
        }).join('');

      }
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        let target = e.target.dataset.targetlink;
        const countriesList = document.querySelector('.countries-list');
        const favoritesList = document.querySelector('.favorites-list');
        const moreList = document.querySelector('.more-list');
        switch(target) {
          case "countries-list":
            countriesList.style.display = 'block';
            favoritesList.style.display = 'none';
            moreList.style.display = 'none';
          break;
          case "favorites-list":
            countriesList.style.display = 'none';
            favoritesList.style.display = 'block';
            moreList.style.display = 'none';
          break;
          case "more-list":
            countriesList.style.display = 'none';
            favoritesList.style.display = 'none';
            moreList.style.display = 'block';
          break;
        }
        e.stopPropagation();
      });
    })

  }

}

const index = new Index();
index.main();






