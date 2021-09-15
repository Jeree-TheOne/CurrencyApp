<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickers"
        :tickers="tickers"
      />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="page > 1"
            @click="page = page - 1"
            style="
              background: lightgray;
              border-radius: 10px;
              margin: 2px;
              padding: 2px 15px;
            "
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page = page + 1"
            style="
              background: lightgray;
              border-radius: 10px;
              margin: 2px;
              padding: 2px 15px;
            "
          >
            Вперед
          </button>
          <div>Фильтр: <input v-model="filter" type="text" /></div>
        </div>
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
            }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div
              class="px-4 py-5 sm:p-6 text-center"
              :class="{
                'bg-red-50': t.invalid,
              }"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graph-element
        :selectedTicker="selectedTicker"
        :graph="graph"
        @close="close()"
      />
    </div>
  </div>
</template>

<script>
import { subscribeToUpdate, unsubscribeFromUpdate } from "./api";
import AddTicker from "./components/AddTicker.vue";
import GraphElement from "./components/GraphElement.vue";
import { getTickers, saveTickers } from "./localManager";
import { saveURL, loadURL } from "./url";

// TODO
// [x] 1. Подсвечивание инвалидных валют
// [x] 2. Проверка валюты "С" через С -> ВТС -> USD без конфликтов с 1 пунктом
// [] 3. Возможность получать данные из ws и использование их в других вкладках нашего домена (Shared Worker)
// [x] 4. Автокомплит для тикеров
// [x] 5. Пофиксить график при ресайзе окна
// [x] 6. Вывести работу с урлом и LS в отдельные модули
// [x] 7. Нормально реализовать валидацию на повторяющийся тикер
// [x] 8. Вывод "подсказки", при попытке добавления существуещего тикера

// TODO components
// [x] 1. Вынести график в отдельный компонент

export default {
  name: "App",

  components: {
    AddTicker,
    GraphElement,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      page: 1,
      filter: "",
    };
  },

  created() {
    this.tickers = getTickers();
    const { filter, page } = loadURL();
    this.filter = filter || "";
    this.page = page || 1;
    this.tickers.forEach((ticker) => {
      subscribeToUpdate(ticker.name, (newPrice) => {
        if (newPrice == "-") ticker.invalid = true;
        this.updatePrice(ticker.name, newPrice);
      });
    });
  },
  computed: {
    tooManyTickers() {
      return this.tickers.length > 20;
    },
    filteredTickers() {
      return this.tickers.filter((t) =>
        t.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter,
      };
    },
  },
  methods: {
    close() {
      this.selectedTicker = null;
    },
    updatePrice(tickerName, price) {
      this.tickers
        .filter((t) => t.name == tickerName)
        .forEach((t) => {
          t.price = price;
          if (t == this.selectedTicker) this.graph.push(price);
        });
    },
    formatPrice(price) {
      if (price == "-") return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    add(ticker) {
      const newTicker = {
        name: ticker.toUpperCase(),
        price: "-",
        invalid: false,
      };
      this.tickers = [...this.tickers, newTicker];
      subscribeToUpdate(newTicker.name, (newPrice) => {
        if (newPrice == "-")
          this.tickers.find((t) => t.name == newTicker.name).invalid = true;
        this.updatePrice(newTicker.name, newPrice);
      });

      this.filter = "";
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(currentTicker) {
      this.tickers = this.tickers.filter((t) => t != currentTicker);
      if (currentTicker == this.selectedTicker) this.selectedTicker = null;
      unsubscribeFromUpdate(currentTicker.name);
    },
    async updateTickers() {
      if (!this.tickers.length) return;
    },
  },
  watch: {
    tickers() {
      saveTickers(this.tickers);
    },
    selectedTicker() {
      this.graph = [];
    },
    paginatedTickers() {
      if (this.paginatedTickers == 0 && this.page > 1) this.page -= 1;
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(values) {
      saveURL(values);
    },
  },
};
</script>
