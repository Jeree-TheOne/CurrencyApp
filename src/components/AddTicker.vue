<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер {{ ticker }}</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            autocomplete="off"
            @input="input"
            @keydown.enter="add"
            v-model="ticker"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
          <div
            style="
              display: flex;
              justify-content: space-evenly;
              align-items: center;
              padding: 2px;
            "
          >
            <button
              v-for="(t, idx) in availableTickers"
              :key="idx"
              @click="
                ticker = t;
                add();
              "
              type="button"
              style="
                background: lightgray;
                border-radius: 10px;
                margin: 2px;
                padding: 2px 15px;
              "
            >
              {{ t }}
            </button>
          </div>
        </div>

        <p class="text-red-500 leading-6 text-sm text-center" v-if="sameTicker">
          Такой тикер уже добавлен
        </p>
        <add-ticker-button @click="add" :disabled="disabled" />
      </div>
    </div>
  </section>
</template>

<script>
import AddTickerButton from "./AddTickerButton.vue";
import { getAvailableTickers } from "../api.js";

export default {
  components: {
    AddTickerButton,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    tickers: {
      type: Array,
      default: new Array(),
      required: false,
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0,
  },

  data() {
    return {
      ticker: null,
      sameTicker: false,
    };
  },

  computed: {
    availableTickers() {
      return getAvailableTickers(this.ticker);
    },
  },

  methods: {
    add() {
      if (!this.ticker) return;
      if (this.tickers.find((t) => t.name == this.ticker)) {
        this.sameTicker = true;
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },

    input() {
      this.ticker = this.ticker.toUpperCase();
      this.sameTicker = false;
    },
  },
};
</script>
